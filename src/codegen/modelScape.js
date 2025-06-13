// search for name: "Other models" in https://platform.openai.com/docs/models

/**
 * Converts a string with hyphens and dots into a valid JavaScript variable name.
 * @param {string} name - The input string (e.g., 'gpt-4.1-mini').
 * @returns {string} A sanitized string (e.g., 'gpt_4_1_mini').
 */
const sanitizeForJs = (/** @type {string} */ name) => name.replace(/[.-]/g, '_')

/**
 * Formats a number into a specific, compact, and readable string representation.
 * - Uses underscore separators for large integers (e.g., 16384 -> '16_384').
 * - Uses the shortest possible scientific 'e' notation for multiples of powers of 10 (e.g., 10000 -> '1e4', 128000 -> '128e3').
 * - Handles non-numeric string values by quoting them.
 * @param {number | string} value - The number or string to format.
 * @returns {string} The formatted string representation.
 */
const formatNumber = function formatNumber(/** @type {number} */ value) {
  if (typeof value !== 'number') return `'${value}'` // For string-based rate limits like "5 img/min"
  if (!Number.isInteger(value) || value < 1_000) return String(value)

  // eslint-disable-next-line unicorn/no-unsafe-regex
  let best = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '_')

  for (let e = 1; e < 15; e++) {
    if (value % 10 ** e === 0) {
      const notation = `${value / 10 ** e}e${e}`
      if (notation.length <= best.length) {
        best = notation
      }
    }
  }
  return best
}

/**
 * Recursively renders a JavaScript value into a formatted string for code generation.
 * @param {*} value - The value to render.
 * @param {number} [indent=1] - The current indentation level.
 * @returns {string} The string representation of the value.
 */
const renderValue = function renderValue(
  /** @type {unknown} */ value,
  indent = 1,
) {
  const i = '  '.repeat(indent)
  const iMinus1 = '  '.repeat(indent - 1)

  if (value === null) return 'null'
  if (typeof value === 'boolean') return String(value)

  if (typeof value === 'string') {
    if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)) {
      const date = new Date(value)
      return `new Date(${formatNumber(date.getTime())})`
    }
    const escaped = value.replaceAll("'", "\\'").replace(/\n/g, '\\n')
    return `'${escaped}'`
  }

  if (typeof value === 'number') {
    return formatNumber(value)
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const items = value
      .map((v) => `${i}${renderValue(v, indent + 1)}`)
      .join(',\n')
    return `[\n${items},\n${iMinus1}]`
  }

  if (value instanceof Date) {
    return `new Date(${formatNumber(value.getTime())})`
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value)
    if (keys.length === 0) return '{}'

    const entries = keys.map((k) => {
      const key = k.match(/^\w+$/) ? k : `'${k}'`
      const val = renderValue(value[k], indent + 1)
      return `${i}${key}: ${val}`
    })
    return `{\n${entries.join(',\n')},\n${iMinus1}}`
  }

  return String(value)
}

/**
 * Generates a TypeScript file as a string from model and snapshot data objects.
 *
 * @param {object} models - The source object containing model configurations, keyed by file path.
 * @param {object} snapshots - The source object containing snapshot specifications, keyed by file path.
 * @param {object | null} [otherModels=null] - Optional object containing pricing data to merge.
 * @returns {string} A string containing the generated TypeScript code.
 */
const codegen = function codegen(models, snapshots, otherModels = null) {
  // --- Pre-processing Step 1: Build a map for efficient snapshot lookup ---
  const snapshotMap = Object.values(snapshots).reduce((acc, snap) => {
    const data = snap.default || snap
    if (data.name) {
      // Create a copy to avoid modifying the original input object
      acc[data.name] = { ...data }
    }
    return acc
  }, {})

  // --- Pre-processing Step 2: Extract all pricing data into a simple map ---
  const priceMap = new Map()
  const seenInPricing = new Set()
  if (otherModels?.subsections) {
    for (const subsection of otherModels.subsections) {
      for (const item of subsection.items || []) {
        if (item.name) {
          seenInPricing.add(item.name)
          if (item.values) {
            priceMap.set(item.name, item.values)
          }
        }
        for (const snapshotPrice of item.snapshots || []) {
          if (snapshotPrice.name) {
            seenInPricing.add(snapshotPrice.name)
            if (snapshotPrice.values) {
              priceMap.set(snapshotPrice.name, snapshotPrice.values)
            }
          }
        }
      }
    }
  }

  // --- Pre-processing Step 3: Merge pricing data into the snapshotMap ---
  for (const [name, priceData] of priceMap.entries()) {
    if (snapshotMap[name]) {
      snapshotMap[name].price_data = priceData
    }
    // Also handle cases where the model name in the price file refers to the current_snapshot
    const modelUsingThisAsCurrent = Object.values(models).find(
      (m) => m?.default?.current_snapshot === name,
    )
    if (modelUsingThisAsCurrent && snapshotMap[name]) {
      const modelName = modelUsingThisAsCurrent.default.name
      if (priceMap.has(modelName)) {
        snapshotMap[name].price_data = priceMap.get(modelName)
      }
    }
  }

  const output = []
  const generatedSpecs = new Set()
  const sortedModelPaths = Object.keys(models).sort()

  // --- Main Generation Loop ---
  for (const modelPath of sortedModelPaths) {
    const modelSource = models[modelPath]
    const configData = modelSource.default || modelSource
    const modelVarName = sanitizeForJs(configData.name)

    const configString = `const ${modelVarName}_config = ${renderValue(
      configData,
    )} as const satisfies ModelConfig`
    output.push(configString, '')

    const snapshotNames = configData.snapshots || []

    for (const snapshotName of snapshotNames) {
      const snapshotData = snapshotMap[snapshotName]
      if (snapshotData && !generatedSpecs.has(snapshotName)) {
        const snapshotVarName = sanitizeForJs(snapshotName)
        const specString = `const ${snapshotVarName}_spec = ${renderValue(
          snapshotData,
        )} as const satisfies ModelSpec`

        output.push(
          specString,
          `export {${snapshotVarName}_spec as '${snapshotName}'}`,
          '',
        )
        generatedSpecs.add(snapshotName)
      }
    }

    const { current_snapshot: currentSnapshotName, name: modelName } =
      configData
    if (
      currentSnapshotName &&
      modelName &&
      snapshotMap[currentSnapshotName] &&
      currentSnapshotName !== modelName
    ) {
      const currentSnapshotVarName = sanitizeForJs(currentSnapshotName)
      output.push(
        `// alias:`,
        `export { ${currentSnapshotVarName}_spec as '${modelName}' };`,
        '',
      )
    }
    output.push('')
  }

  // --- Final Step: Report on missing models ---
  const missingModels = [...seenInPricing].filter(
    (name) =>
      !generatedSpecs.has(name) && !models[`./models-data/${name}.yaml`],
  )

  if (missingModels.length > 0) {
    output.push(
      '/*',
      ' --- Missing Models ---',
      ' The following models were found in the pricing data but not in the main models/snapshots sources:',
    )
    for (const missing of missingModels.sort()) {
      output.push(` - ${missing}`)
    }
    output.push('*/')
  }

  return output.join('\n').replace(/\n{3,}/g, '\n\n')
}

// set a breakpoint in https://platform.openai.com/docs/pricing
// and run this entire file with the last uncommented to get the data:
// copy(codegen(hC, pC, aC))
