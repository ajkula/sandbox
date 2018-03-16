module.exports = class DB {
  
  constructor() {
    this.idCount = 0
    this.db = new Map()
    Object.entries(require('./store-mock.json')).forEach(([k, v]) => {
      this.db.set(k, v)
      this.idCount++
    });
  }

  get(id) {
    return this.db.get(id) || null
  }
  upsert(data, id = null) {
    if (id && data) {
      this.db.set(id, data)
    } else {
      if ((data).id) {
      this.db.set(data.id, data)
      } else {
        // créer l'ID et l'attr à data
        
      }
    }
  }
}