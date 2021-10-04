export class BaseItemQueryStrategy {
    async getItems(policyId) {
        throw new Error('getItems() has not been implemented!');
    }

    getName() {
        throw new Error('getName() has not been implemented!');
    }
}
