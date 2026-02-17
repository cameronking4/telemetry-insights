// BUG: This file imports lodash but package.json doesn't have it listed
// in dependencies (or it was removed), causing build failures
import _ from 'lodash'

export function processData(data: any[]): any[] {
  // Using lodash functions that will fail at build time
  return _.chunk(data, 2)
}

export function formatItems(items: any[]): string {
  return _.join(items, ', ')
}
