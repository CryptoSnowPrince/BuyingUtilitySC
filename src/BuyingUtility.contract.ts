enum ErrorCodes {
    BUYING_UTILITY_NOT_BOT,
    BUYING_UTILITY_NOT_ADMIN,
    BUYING_UTILITY_REENTRANT_CALL,
    BUYING_UTILITY_INSUFFICIENT_WITHDRAW_AMOUNT,
    BUYING_UTILITY_EXPIRED,
    BUYING_UTILITY_INSUFFICIENT_TEZ_TO_SWAP,
    BUYING_UTILITY_OVER_SLIPPAGES,
}

const _NOT_ENTERED = 1;
const _ENTERED = 2;

// Declare the storage type definition
interface BuyingUtilityStorage {
    _admin: TAddress;
    _status: TNat;
    _bot_role: TMap<TAddress, TBool>;
    pendingPlatformFee: TMutez;
}

const BOT_ROLE = true;

@Contract
export class BuyingUtility {
    public storage: BuyingUtilityStorage = {
        _admin: 'tz1afKmEFo11mpXr4JdodJDTXYLfw7GTFbak',
        _status: _NOT_ENTERED,
        _bot_role: [],
        pendingPlatformFee: 0,
    };

    constructor() {
        this.storage._admin = Sp.source;
        this.storage._bot_role.set(Sp.source, BOT_ROLE)
    }

    @Inline
    failIfSenderNotBOT() {
        Sp.verify(this.storage._bot_role.get(Sp.sender) === BOT_ROLE, ErrorCodes.BUYING_UTILITY_NOT_BOT);
    }

    /**
     * @description Fail if the sender is not _admin
     */
    @Inline
    failIfSenderNotAdmin() {
        Sp.verify(Sp.sender === this.storage._admin, ErrorCodes.BUYING_UTILITY_NOT_ADMIN);
    }

    /**
     * @description Fail if the _status is _ENTERED. Set _status to _ENTERED
     */
    @Inline
    nonReentrantStart() {
        Sp.verify(this.storage._status !== _ENTERED, ErrorCodes.BUYING_UTILITY_REENTRANT_CALL);
        this.storage._status = _ENTERED;
    }

    /**
     * @description Set _status to _NOT_ENTERED
     */
    @Inline
    nonReentrantEnd() {
        this.storage._status = _NOT_ENTERED;
    }

    @EntryPoint
    withdrawFee(to: TAddress, amount: TMutez): void {
        this.failIfSenderNotAdmin()
        Sp.verify(amount <= this.storage.pendingPlatformFee, ErrorCodes.BUYING_UTILITY_INSUFFICIENT_WITHDRAW_AMOUNT);

        this.storage.pendingPlatformFee -= amount;

        Sp.transfer(Sp.unit, amount, Sp.contract<TUnit>(to).openSome('Invalid Interface'));
    }

    @EntryPoint
    buyToken(
        dexAddress: TAddress,
        tokenAmountPerTEZ: TNat,
        slippageBIPS: TNat,
        to: TAddress,
        platformFeeBIPS: TNat,
        deadline: TTimestamp
    ): void {
        this.failIfSenderNotBOT();
        this.nonReentrantStart();

        Sp.verify(Sp.now <= deadline, ErrorCodes.BUYING_UTILITY_EXPIRED);
        Sp.verify(slippageBIPS <= 1E4, ErrorCodes.BUYING_UTILITY_OVER_SLIPPAGES)

        const platformFee = Sp.ediv(platformFeeBIPS.multiply(Sp.amount), 1E4 as TNat).openSome('Invalid Calculation platformFee');
        this.storage.pendingPlatformFee += platformFee.fst();

        Sp.verify(Sp.amount > platformFee.fst(), ErrorCodes.BUYING_UTILITY_INSUFFICIENT_TEZ_TO_SWAP);
        const tezAmount: TMutez = Sp.amount - platformFee.fst();

        const intVal: TInt = (1E4 - slippageBIPS);
        const minTokensBought: TNat = Sp.ediv(tezAmount, 1 as TMutez).openSome().fst() * tokenAmountPerTEZ * intVal.toNat() / 1E10;
        const aPair: TTuple<[TAddress, TNat, TTimestamp]> = [to, minTokensBought, deadline];
        
        const contact = Sp.contract<TTuple<[TAddress, TNat, TTimestamp]>>(dexAddress, 'xtzToToken').openSome('Invalid Interface');
        Sp.transfer(aPair, tezAmount, contact)

        this.nonReentrantEnd();
    }

    @EntryPoint
    setAdmin(_newAdmin: TAddress): void {
        this.failIfSenderNotAdmin()
        this.storage._admin = _newAdmin;
    }

    @EntryPoint
    setBotRole(_bot_role: TAddress, _enable: TBool): void {
        this.failIfSenderNotAdmin()
        this.storage._bot_role.set(_bot_role, _enable);
    }
}

Dev.compileContract('buyingUtility', new BuyingUtility());
