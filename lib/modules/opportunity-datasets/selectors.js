// @flow
import sortBy from 'lodash/sortBy'
import {createSelector} from 'reselect'

import selectCurrentRegionId from '../../selectors/current-region-id'

import type {State} from './types'

/**
 * Select all of the Opportunity Datasets for a region
 */
export const opportunityDatasets = createSelector(
  (state) => state.opportunityDatasets.datasets,
  (datasets) => sortBy(datasets, ['sourceName', 'name'])
)

/**
 * Select the active dataset for a region
 */
export const activeOpportunityDataset = createSelector(
  opportunityDatasets,
  (state) => state.opportunityDatasets.activeDataset,
  (datasets, _id) => datasets.find((d) => d._id === _id)
)

/**
 * Select the grid of an active dataset for a region
 */
export const activeOpportunityDatasetGrid = createSelector(
  activeOpportunityDataset,
  (dataset) => dataset && dataset.grid
)

/**
 * Select the region ID and create the base url for opportunity dataset
 * management
 */
export const opportunitiesUrl = createSelector(
  selectCurrentRegionId,
  (regionId) => `/regions/${regionId}/opportunities`
)

/**
 * Get all of the dataset upload statuses
 */
export const uploadStatuses = (state: {
  opportunityDatasets: State
}) =>
  state.opportunityDatasets.uploadStatuses
