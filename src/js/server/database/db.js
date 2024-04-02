module.exports = class DB {
    static EQUAL = `..eq..`
    static NOT_EQUAL = `..ne..`
    static LESS_THAN = `..lt..`
    static LESS_THAN_OR_EQUAL = `..le..`
    static GREATER_THAN = `..gt..`
    static GREATER_THAN_OR_EQUAL = `..ge..`
    static FALSEY = `..f..`
    static TRUTHY = `..t..`
     /**
     * Parses a where clause string into an array of query conditions. 
     * Handles parsing the opening/closing brackets, splitting by comma, 
     * parsing the field name, comparison operator, and optional value.
     * Returns null if parsing fails.
     * 
     * The Where Clause has the following format:
     * [<FieldName><Comparison><Value>,<FieldName><Comparison><Value>...]
     * Value is not used for FALSEY and TRUTHY comparisions.
     * Examples:
     *  [id..eq..123]
     *  [lastName..t..]
     *  [startDate..ge..01-31-1999,salary..gt..100000]
     * Date format = MM-DD-YYYY
     * Time format = HH:MM:SS
     * Email format = name.name@site.com
    */
    static parseWhere(where) {
        const finalWhere = where ? where : `[]`
        if (`[` !== finalWhere[0] || `]` !== finalWhere[finalWhere.length - 1]) { return null }
        const results = []
        const strippedWhere = finalWhere.trim().substring(1).substring(0, finalWhere.length - 2)
        const splitWhere = strippedWhere.split(`,`)
        const subClauses = ('' === splitWhere[0]) ? [] : splitWhere

        for (let subClause of subClauses) {
            const tokens = subClause.split(`..`)

            if (3 < tokens.length) { return null }
            if (2 > tokens.length) { return null }
            if (2 === tokens.length) { if (DB.FALSEY !== tokens[1] && DB.TRUTHY !== tokens[1]) { return null } }

            const parsedToken = { field: tokens[0], compare: `..${tokens[1]}..` }

            if (3 === tokens.length && tokens[2].length) { parsedToken[`value`] = tokens[2] }
            results.push(parsedToken)
        }
        return results
    }
    /**
     * Compares an object against parsed where clauses to check if it matches.
     * Loops through each where clause and compares the object's field value.
     * Supports various comparison operators and converts values to ints.
     * Returns true if all where clauses match, false otherwise.
     */
    static compare(object, parsedWhere) {
        for (let subClause of parsedWhere) {
            let matches = false
            const intValue = parseInt(subClause.value)
            const objectValue = object[subClause.field]

            if (DB.EQUAL === subClause.compare) { if (objectValue === subClause.value || objectValue === intValue) { matches = true } }
            if (DB.NOT_EQUAL === subClause.compare) { if (objectValue !== subClause.value && objectValue !== intValue) { matches = true } }
            if (DB.LESS_THAN === subClause.compare) { if (objectValue < subClause.value || objectValue < intValue) { matches = true } }
            if (DB.LESS_THAN_OR_EQUAL === subClause.compare) { if (objectValue <= subClause.value || objectValue <= intValue) { matches = true } }
            if (DB.GREATER_THAN === subClause.compare) { if (objectValue > subClause.value || objectValue > intValue) { matches = true } }
            if (DB.GREATER_THAN_OR_EQUAL === subClause.compare) { if (objectValue >= subClause.value || objectValue >= intValue) { matches = true } }
            if (DB.FALSEY === subClause.compare) { if (!objectValue) { matches = true } }
            if (DB.TRUTHY === subClause.compare) { if (objectValue) { matches = true } }
            if (!matches) { return false }
        }
        return true
    }
    /**
     * Calculates the number of pages based on the array length and page size.
     * Rounds up to account for partial pages.
     */
    static pageCount(objectArray, pageSize) {
        const count = Math.ceil(objectArray.length / pageSize)

        return count
    }
    /**
     * Paginates an array of objects by slicing it into pages of a given size.
     * Returns just the page specified by pageNumber.
     */
    static paginate(objectArray, pageSize, pageNumber) {
        let index = pageNumber * pageSize
        const result = []

        for (let loop = index; loop < index + pageSize; loop++) { result.push(objectArray[loop]) }
        return result
    }
    /**
     * Writes the given table data to the database.
     * 
     * @param {string} tableName - The name of the table to write to.
     * @param {Object[]} table - An array of objects representing the table rows.
     */
    async writeTable(tableName, table) { }
    /**
     * Connects to the database.
     * 
     * @param {string} user - The username for the database. 
     * @param {string} pass - The password for the database.
     */
    async connect(user, pass) { }
    /**
     * Checks if the database connection is open.
     * 
     * @returns {Promise<boolean>} Promise resolving to true if connected, false if disconnected.
     */
    async isConnected() { }
    /**
     * Selects the given namespace and database to use.
     * 
     * @param {string} namespace - The namespace to select.
     * @param {string} database - The database to select.
     */
    async use(namespace, database) { }
    /**
     * Closes the connection to the database.
     */
    async close() { }
    /**
     * Selects rows from the given table where the given conditions are met.
     * 
     * @param {string} tableName - The name of the table to select from.
     * @param {Object} where - The conditions to filter the rows by.
     * @returns {Object[]} The selected rows.
     */
    async select(tableName, where) {
        const parsedWhere = DB.parseWhere(where)
        const originalTable = this.tables.get(tableName)
        const table = []

        for (let loop = 0; loop < originalTable.length; loop++) {
            const row = originalTable[loop]

            if (!DB.compare(row, parsedWhere)) { continue }
            table.push(row)
        }
        return table
    }
    /**
     * Creates a new row in the table with the given data.
     * 
     * @param {string} tableName - The name of the table to insert into.
     * @param {Object} data - The data for the new row.
     * @returns {Promise<boolean>} Promise resolving to true if row inserted successfully.
     */
    async create(tableName, data) {
        const originalTable = this.tables.get(tableName) || []
        const table = [...originalTable]

        table.push(data)

        const success = await this.writeTable(tableName, table)

        if (success) { this.tables.set(tableName, table) }
        return success
    }
    /**
     * Updates existing rows in the table that match the given where condition
     * with the provided data. 
     * 
     * Searches through the rows and updates any that match the where condition
     * with the provided data. Keeps track of which rows were updated and returns
     * whether any rows were updated.
     *  
     * @param {string} tableName - The table name
     * @param {Object} data - The data to update the matching rows with 
     * @param {Object} where - The where condition to match rows against
     * @returns {boolean} Whether any rows were updated
     */
    async update(tableName, data, where) {
        const parsedWhere = DB.parseWhere(where)
        const originalTable = this.tables.get(tableName)
        const table = [...originalTable]
        let didUpdate = false
        const updates = []

        if (!table) { return false }
        for (let loop = 0; loop < table.length; loop++) {
            const row = table[loop]

            if (!DB.compare(row, parsedWhere)) { continue }

            const newData = { ...row, ...data }

            updates.push({ index: loop, data: newData })
            didUpdate = true
        }
        if (didUpdate) {
            for (let update of updates) { table[update.index] = update.data }

            const success = await this.writeTable(tableName, table)

            if (success) { this.tables.set(tableName, table) }
            else { didUpdate = false }
        }
        return didUpdate
    }
    /**
     * Removes rows from the table that match the given where condition.
     * 
     * Loops through the rows and removes any that match the parsed where condition.
     * Keeps track of which rows were removed and returns whether any rows were deleted.
     * 
     * @param {string} tableName - The table name
     * @param {Object} where - The where condition to match rows against 
     * @returns {boolean} Whether any rows were deleted
    */
    async remove(tableName, where) {
        const parsedWhere = DB.parseWhere(where)
        const originalTable = this.tables.get(tableName)
        const table = []
        let didDelete = false

        for (let loop = 0; loop < originalTable.length; loop++) {
            const row = originalTable[loop]

            if (DB.compare(row, parsedWhere)) {
                didDelete = true
                continue
            }
            table.push(row)
        }
        if (didDelete) {
            const success = await this.writeTable(tableName, table)

            if (success) { this.tables.set(tableName, table) }
            else { didDelete = false }
        }
        return didDelete
    }

    /**
     * Tests different where clause formats by parsing them and comparing 
     * sample data objects against the parsed where conditions.
     * 
     * Logs the parsed where clause, comparison results, and info about the
     * comparison operators used.
     */
    static testWhereClause() {
        console.log(JSON.stringify(DB.parseWhere(`[id..eq..123]`)))
        console.log(JSON.stringify(DB.parseWhere(`id..eq..123`)))
        console.log(JSON.stringify(DB.parseWhere(`[id..eq..123`)))
        console.log(JSON.stringify(DB.parseWhere(`id..eq..123]`)))
        console.log(JSON.stringify(DB.parseWhere(`[lastName..t..]`)))
        console.log(JSON.stringify(DB.parseWhere(`[startDate..ge..01-31-1999,salary..gt..100000]`)))

        let parsedWhere = DB.parseWhere(`[id..eq..123]`)
        let compareResult = DB.compare({ id: 123 }, parsedWhere)

        console.log(DB.EQUAL)
        console.log(compareResult)
        compareResult = DB.compare({ id: 12345 }, parsedWhere)
        console.log(compareResult)
        compareResult = DB.compare({ id: `Cat` }, parsedWhere)
        console.log(compareResult)

        console.log(DB.TRUTHY)
        parsedWhere = DB.parseWhere(`[lastName..t..]`)
        compareResult = DB.compare({ lastName: `Smith` }, parsedWhere)
        console.log(compareResult)
        compareResult = DB.compare({ firstName: `Steve` }, parsedWhere)
        console.log(compareResult)

        console.log(`${DB.GREATER_THAN_OR_EQUAL} and ${DB.GREATER_THAN}`)
        parsedWhere = DB.parseWhere(`[startDate..ge..01-31-1999,salary..gt..100000]`)
        compareResult = DB.compare({ startDate: `01-31-1999`, salary: 110000 }, parsedWhere)
        console.log(compareResult)
        compareResult = DB.compare({ startDate: `01-31-1999`, salary: 100000 }, parsedWhere)
        console.log(compareResult)
        compareResult = DB.compare({ startDate: `01-31-1999`, salary: `110000` }, parsedWhere)
        console.log(compareResult)
        compareResult = DB.compare({ startDate: `01-31-1999`, salary: `100000` }, parsedWhere)
        console.log(compareResult)
        compareResult = DB.compare({ salary: 100000 }, parsedWhere)
        console.log(compareResult)
        compareResult = DB.compare({ startDate: `01-31-1999` }, parsedWhere)
        console.log(compareResult)

        console.log(`Empty Where Clause`)
        compareResult = DB.compare({ startDate: `01-31-1999`, salary: 110000 }, [])
        console.log(compareResult)
    }
    /**
     * Tests pagination by generating sample data, paginating it with different 
     * page sizes and page numbers, and logging the results.
     * 
     * This demonstrates how the paginate() method works and how to page through
     * sample data sets.
     */
    static testPaginate() {
        const data = []

        for (let loop = 0; loop < 100; loop++) { data.push(loop) }

        let result = DB.paginate(data, 5, 0)
        console.log(JSON.stringify(result))
        result = DB.paginate(data, 5, 1)
        console.log(JSON.stringify(result))
        result = DB.paginate(data, 5, 2)
        console.log(JSON.stringify(result))
        result = DB.paginate(data, 5, 10)
        console.log(JSON.stringify(result))
        result = DB.paginate(data, 5, 19)
        console.log(JSON.stringify(result))
        result = DB.paginate(data, 10, 0)
        console.log(JSON.stringify(result))
        result = DB.paginate(data, 10, 1)
        console.log(JSON.stringify(result))
        result = DB.paginate(data, 10, 2)
        console.log(JSON.stringify(result))
        result = DB.paginate(data, 10, 9)
        console.log(JSON.stringify(result))
    }
}
