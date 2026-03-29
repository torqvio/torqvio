// Performance-optimized JSON utilities
// Reduces redundant parsing and improves error handling

interface JSONObject {
  [key: string]: any;
}

// Cache for frequently parsed JSON objects
const jsonParseCache = new Map<string, any>();
const jsonStringifyCache = new WeakMap<object, string>();

// Maximum cache size to prevent memory leaks
const MAX_CACHE_SIZE = 1000;

/**
 * Safe JSON parse with caching and error handling
 */
export function safeJsonParse(json: string | null | undefined, fallback: any = {}): any {
  if (!json || json === undefined) return fallback;
  
  // Return object directly if not a string
  if (typeof json !== 'string') return json;
  
  // Check cache first
  if (jsonParseCache.has(json)) {
    return jsonParseCache.get(json);
  }
  
  try {
    const parsed = JSON.parse(json);
    
    // Cache the result (with size limit)
    if (jsonParseCache.size >= MAX_CACHE_SIZE) {
      // Clear oldest entries (simple LRU)
      const firstKey = jsonParseCache.keys().next().value;
      if (firstKey) {
        jsonParseCache.delete(firstKey);
      }
    }
    jsonParseCache.set(json, parsed);
    
    return parsed;
  } catch (error) {
    console.warn('JSON parse error:', error instanceof Error ? error.message : error);
    return fallback;
  }
}

/**
 * Safe JSON stringify with caching and error handling
 */
export function safeJsonStringify(obj: any, fallback: string = '{}'): string {
  if (obj === null || obj === undefined) return fallback;
  
  // Return string directly if already a string
  if (typeof obj === 'string') return obj;
  
  // Check cache first
  if (jsonStringifyCache.has(obj)) {
    return jsonStringifyCache.get(obj)!;
  }
  
  try {
    const stringified = JSON.stringify(obj);
    
    // Cache the result
    jsonStringifyCache.set(obj, stringified);
    
    return stringified;
  } catch (error) {
    console.warn('JSON stringify error:', error instanceof Error ? error.message : error);
    return fallback;
  }
}

/**
 * Extract specific property from JSON string without parsing entire object
 * More efficient for large JSON objects when only specific fields are needed
 */
export function extractJsonProperty(json: string | null | undefined, property: string): any {
  if (!json || typeof json !== 'string') return undefined;
  
  try {
    // Simple regex-based extraction (works for simple cases)
    const regex = new RegExp(`"${property}"\\s*:\\s*([^,}\\]]+)`, 'i');
    const match = json.match(regex);
    
    if (match) {
      const value = match[1].trim();
      
      // Try to parse the value
      if (value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1); // String value
      } else if (value === 'true' || value === 'false') {
        return value === 'true'; // Boolean value
      } else if (!isNaN(Number(value))) {
        return Number(value); // Number value
      } else if (value.startsWith('{') || value.startsWith('[')) {
        return JSON.parse(value); // Nested object/array
      }
    }
    
    // Fallback to full parse
    const parsed = JSON.parse(json);
    return parsed[property];
  } catch (error) {
    return undefined;
  }
}

/**
 * Batch JSON parsing for arrays
 * More efficient than parsing individually
 */
export function batchJsonParse(jsonArray: (string | null | undefined)[], fallback: any = {}): any[] {
  return jsonArray.map(json => safeJsonParse(json, fallback));
}

/**
 * Optimized workflow definition parser
 * Specifically handles workflow JSON structure
 */
export function parseWorkflowDefinition(definition: string | null | object): JSONObject {
  if (!definition) return {};
  
  if (typeof definition === 'object') {
    return definition as JSONObject;
  }
  
  const parsed = safeJsonParse(definition, {});
  
  // Ensure it has expected structure
  return {
    steps: Array.isArray(parsed.steps) ? parsed.steps : [],
    retryPolicy: parsed.retryPolicy || {},
    timeout: parsed.timeout || 30000,
    ...parsed
  };
}

/**
 * Optimized execution payload parser
 * Specifically handles execution payload structure
 */
export function parseExecutionPayload(payload: string | null | object): JSONObject {
  if (!payload) return {};
  
  if (typeof payload === 'object') {
    return payload as JSONObject;
  }
  
  return safeJsonParse(payload, {});
}

/**
 * Clear JSON caches (useful for testing or memory management)
 */
export function clearJsonCache(): void {
  jsonParseCache.clear();
  // WeakMap doesn't need manual clearing
}

/**
 * Get cache statistics for monitoring
 */
export function getJsonCacheStats(): { parseCache: number; stringifyCache: string } {
  return {
    parseCache: jsonParseCache.size,
    stringifyCache: 'WeakMap (size not available)'
  };
}
