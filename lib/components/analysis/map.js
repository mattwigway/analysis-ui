// @flow
import lonlat from '@conveyal/lonlat'
import Leaflet from 'leaflet'
import React from 'react'
import {GeoJSON, Marker, Rectangle, Tooltip} from 'react-leaflet'
import uuid from 'uuid'

import colors from '../../constants/colors'
import DestinationTravelTimeDistribution from '../map/destination-travel-time-distribution'
import EditBounds from '../map/edit-bounds'
import LabelLayer from '../map/label-layer'
import Map from '../map'
import ModificationsMap from '../../containers/modifications-map'
import OpportunityDatasets from '../../modules/opportunity-datasets'
import {fromLatLngBounds, reprojectBounds} from '../../utils/bounds'

import type {Bounds, LonLat, Quintiles} from '../../types'

type Isochrone = any

type Props = {
  analysisBounds: Leaflet.LatLngBounds,
  comparisonDistribution?: Quintiles,
  comparisonIsochrone?: Isochrone,
  destination?: LonLat,
  disableMarker: boolean,
  displayedDataIsCurrent: boolean,
  distribution?: Quintiles,
  isochrone?: Isochrone,
  markerPosition: Leaflet.LatLng,
  markerTooltip?: string,
  removeDestination: () => void,
  setBounds: (bounds: Bounds) => void,
  setDestination: (destination: LonLat) => void,
  setOrigin: (origin: LonLat) => void,
  showBoundsEditor: boolean
}

const isochroneStyle = (fillColor) => ({
  fillColor,
  opacity: 0.65,
  pointerEvents: 'none',
  stroke: false
})

export default class AnalysisMap extends React.Component {
  props: Props
  // Leaflet bug that causes a map click when dragging a marker fast:
  // https://github.com/Leaflet/Leaflet/issues/4457#issuecomment-351682174
  _avoidClick = false

  /**
   * Set the destination if a `DragEndEvent` has not occured too recently.
   */
  _clickMap = (e: Leaflet.MapEvent) => {
    if (!this._avoidClick) {
      this.props.setDestination(lonlat(e.latlng))
    }
  }

  /**
   * Set hte origin and fetch if ready.
   */
  _dragMarker = (e: Leaflet.DragEndEvent) => {
    this._avoidClick = true
    setTimeout(() => {
      this._avoidClick = false
    }, 50)

    this.props.setOrigin(lonlat(e.target.getLatLng()))
  }

  _setBounds = (bounds: Leaflet.LatLngBounds) =>
    this.props.setBounds(fromLatLngBounds(bounds))

  render () {
    const p = this.props
    return (
      <Map onClick={this._clickMap}>
        <OpportunityDatasets.components.DotMap />

        <Rectangle
          bounds={reprojectBounds(p.analysisBounds)}
          dashArray='3 8'
          fillOpacity={0}
          pointerEvents='none'
          weight={1}
        />

        <ModificationsMap />

        {p.displayedDataIsCurrent && p.isochrone &&
          <GeoJSON
            data={p.isochrone}
            key={uuid.v4()}
            style={isochroneStyle(colors.PROJECT_ISOCHRONE_COLOR)}
          />}

        {p.displayedDataIsCurrent && p.comparisonIsochrone &&
          <GeoJSON
            data={p.comparisonIsochrone}
            key={uuid.v4()}
            style={isochroneStyle(colors.COMPARISON_ISOCHRONE_COLOR)}
          />}

        <LabelLayer />

        <Marker
          draggable={!p.disableMarker}
          opacity={p.disableMarker ? 0.5 : 1.0}
          onDragEnd={this._dragMarker}
          position={p.markerPosition}
        >
          {p.markerTooltip &&
            <Tooltip permanent><span>{p.markerTooltip}</span></Tooltip>}
        </Marker>

        {p.displayedDataIsCurrent && p.destination &&
          <DestinationTravelTimeDistribution
            key={lonlat.toString(p.destination)}
            comparisonDistribution={p.comparisonDistribution}
            destination={p.destination}
            distribution={p.distribution}
            remove={p.removeDestination}
            setDestination={p.setDestination}
          />}

        {p.showBoundsEditor &&
          <EditBounds
            bounds={p.analysisBounds}
            save={this._setBounds}
          />}
      </Map>
    )
  }
}