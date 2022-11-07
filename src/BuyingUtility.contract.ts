@Contract
export class BuyingUtility {
    @EntryPoint
    buyToken(dexAddress: TAddress, to: TAddress, minTokensBought: TNat, deadline: TTimestamp): void {
        const aPair: TTuple<[TAddress, TNat, TTimestamp]> = [to, minTokensBought, deadline];
        const contact = Sp.contract<TTuple<[TAddress, TNat, TTimestamp]>>(dexAddress, 'xtzToToken').openSome('Invalid Interface');
        Sp.transfer(aPair, Sp.amount, contact)
    }
}

Dev.compileContract('buyingUtility', new BuyingUtility());
