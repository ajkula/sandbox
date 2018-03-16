let uuid = require('node-uuid');
const Promise = require('bluebird')
const Logger = require('../utils/Logger')

module.exports = class AbstractModel {
  /**
   * Abstract CouchBase model
   * @param connector
   */
  constructor (connector) {
    this.idPrefix = null
    this.connector = connector
  }

  /**
   * Fetch a document from CouchBase with ID of model
   * @param id
   * @param suffix
   * @return {Promise.<Map>}
   */
  findById (id, suffix = null) {
    const key = this._buildCbKey(id, suffix)
    return this.connector.get(key)
  }

  /**
   * Get collection of documents
   * @param ids
   * @param suffix
   * @return Collection of document
   */
  async findByMultipleId (ids, suffix = null) {
    let results = {}
    await Promise.map(ids, async (id) => {
      const key = this._buildCbKey(id, suffix)
      results[id] = await this.connector.get(key)
    });

    return results
  }

  /**
   * Create or update a object in CouchBase
   * @param id
   * @param data
   * @param options
   * @return {Promise}
   */
  save (id, data, options = {expiry: 0}) {
    const key = this._buildCbKey(id)
    return this.connector.save(key, data, options)
  }

  /**
   * Increment a key
   * @param id
   * @param delta
   */
  counter (id, delta = 1) {
    const key = this._buildCbKey(id)
    return this.connector.counter(key, delta)
  }

  /**
   * Build couchbase key by adding prefix and sufix
   * @param id
   * @param suffix
   * @returns {*}
   * @private
   */
  _buildCbKey (id, suffix = null) {
    let key = id + ''
    if (key.substring(0, this.idPrefix.length) !== this.idPrefix) {
      key = this.idPrefix + key
    }

    if (suffix !== null) {
      key += suffix
    }

    return key
  }

  /**
   * Health check
   * @return {Promise}
   */
  async health () {
    const uid = uuid.v4()
    try {
      await this.save(uid, {id: uid, value: '42'}, {'expiry': 20})
      const result = await this.findById(uid)
      return ((result || {}).value || null) === '42'
    } catch (err) {
      Logger.log('error', `Health error: ${err.message}`)
      return false
    }
  }
}
