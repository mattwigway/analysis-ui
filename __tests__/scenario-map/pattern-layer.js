/* global describe, it, expect */

import { mount } from 'enzyme'
import React from 'react'
import { Map } from 'react-leaflet'

import { mockFeed, mockModification } from '../test-utils/mock-data'
import Leaflet from '../test-utils/mock-leaflet'

import PatternLayer from '../../lib/scenario-map/pattern-layer'

describe('Scenario-Map > PatternLayer', () => {
  it('renders correctly', () => {
    const props = {
      activeTrips: [],
      color: 'blue',
      dim: true,
      feed: mockFeed,
      modification: mockModification
    }

    // mount component
    mount(
      <Map>
        <PatternLayer
          {...props}
          />
      </Map>
      , {
        attachTo: document.getElementById('test')
      }
    )

    // expect geojson to be added to map by intercepting call to Leaflet
    expect(Leaflet.geoJson.mock.calls[0][0]).toMatchSnapshot()
  })
})