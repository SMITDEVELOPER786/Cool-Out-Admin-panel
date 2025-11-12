export class QuoteManager {
  static storageKey = "moodQuotes";

  static getQuotes() {
    const saved = localStorage.getItem(this.storageKey);
    return saved ? JSON.parse(saved) : {};
  }

  static saveQuotes(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  static clearQuotes() {
    localStorage.removeItem(this.storageKey);
  }
}