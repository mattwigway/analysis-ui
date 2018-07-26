// @flow
import Icon from '@conveyal/woonerf/components/icon'
import {Map as LeafletMap} from 'leaflet'
import React, {Component} from 'react'
import Select from 'react-select'
import {sprintf} from 'sprintf-js'

import {Button} from '../buttons'
import {Group, Number as InputNumber, TextArea} from '../input'
import EgressModeSelector from './egress-mode-selector'
import messages from '../../utils/messages'

import type {Bounds, ProfileRequest} from '../../types'

type Props = {
  customProfileRequestJson: any,
  disabled: boolean,
  hideBoundsEditor: () => void,
  profileRequest: ProfileRequest,
  regionalAnalyses: Array<Bounds & {
      _id: string,
      name: string,
      height: number,
      width: number,
      zoom: number
    }>,
  regionalAnalysisBounds?: Bounds,
  regionBounds: Bounds,
  setProfileRequest: (profileRequestFields: any) => void,
  showBoundsEditor: () => void,
  setCustomProfileRequestJson: any => void
}

type State = {
  advancedSectionCollapsed: boolean,
  editingBounds: boolean
}

/** Edit the advanced parameters of an analysis */
export default class AdvancedSettings extends Component {
  props: Props
  state: State

  state = {
    advancedSectionCollapsed: true,
    editingBounds: false
  }

  _hideBoundsSelector = () => {
    this.props.hideBoundsEditor()
    this.setState({editingBounds: false})
  }

  set (newFields: any) {
    this.props.setProfileRequest(newFields)
  }

  /** Max rides is one more than max transfers, but transfers is more common usage terminology */
  setMaxTransfers = (e: Event & {target: HTMLInputElement}) =>
    this.set({maxRides: parseInt(e.target.value) + 1})
  setMonteCarloDraws = (e: Event & {target: HTMLInputElement}) =>
    this.set({monteCarloDraws: parseInt(e.target.value)})
  setWalkSpeed = (e: Event & {target: HTMLInputElement}) =>
    this.set({walkSpeed: parseFloat(e.target.value) / 3.6}) // km/h to m/s
  setBikeSpeed = (e: Event & {target: HTMLInputElement}) =>
    this.set({bikeSpeed: parseFloat(e.target.value) / 3.6}) // km/h to m/s
  setMaxWalkTime = (e: Event & {target: HTMLInputElement}) =>
    this.set({maxWalkTime: parseInt(e.target.value)})
  setMaxBikeTime = (e: Event & {target: HTMLInputElement}) =>
    this.set({maxBikeTime: parseInt(e.target.value)})

  _setCustomProfileRequestJson = (e: Event & {target: HTMLInputElement}) => {
    const customProfileRequestJson = JSON.parse('{' + e.target.value + '}') // TODO error handling
    this.props.setCustomProfileRequestJson(customProfileRequestJson)
  }

  _setRegionalAnalysisBounds = (e: {value: string}) => {
    const p = this.props

    if (e.value === '__REGION') {
      p.setProfileRequest({bounds: p.regionBounds})
    } else if (p.regionalAnalyses) {
      const foundAnalyses = p.regionalAnalyses.find(r => r._id === e.value)
      if (foundAnalyses) {
        p.setProfileRequest({bounds: webMercatorBoundsToGeographic(foundAnalyses)})
      }
    }
  }

  _showBoundsSelector = () => {
    this.props.showBoundsEditor()
    this.setState({editingBounds: true})
  }

  _toggleAdvancedCollapsed = () => {
    this.setState({
      advancedSectionCollapsed: !this.state.advancedSectionCollapsed
    })
  }

  /** Render the dropdown box that allows selecting regional analysis bounds */
  renderRegionalAnalysisBoundsSelector (disableInputs: boolean) {
    const {regionalAnalysisBounds, regionBounds, regionalAnalyses} = this.props

    // figure out which is selected
    let selected
    if (
      !regionalAnalysisBounds ||
      boundsEqual(regionalAnalysisBounds, regionBounds)
    ) {
      selected = '__REGION' // special value
    } else {
      const selectedAnalysis = regionalAnalyses.find(r =>
        boundsEqual(webMercatorBoundsToGeographic(r), regionalAnalysisBounds)
      )

      if (selectedAnalysis != null) selected = selectedAnalysis._id
      else selected = '__CUSTOM'
    }

    const options = [
      {value: '__REGION', label: messages.analysis.regionalBoundsRegion},
      ...regionalAnalyses.map(({name, _id}) => ({
        value: _id,
        label: sprintf(messages.analysis.regionalBoundsSame, name)
      }))
    ]

    if (selected === '__CUSTOM') {
      // Don't allow the user to select 'Custom' - to make custom bounds, just drag the map markers
      options.push({
        value: '__CUSTOM',
        label: messages.analysis.regionalBoundsCustom,
        disabled: true
      })
    }

    const {editingBounds} = this.state

    return (
      <Group label={messages.analysis.regionalBounds}>
        <div className='row'>
          <div className='col-xs-6'>
            <Select
              clearable={false}
              disabled={disableInputs}
              value={selected}
              options={options}
              onChange={this._setRegionalAnalysisBounds}
            />
          </div>
          <div className='col-xs-6'>
            {editingBounds
              ? <Button
                block
                onClick={this._hideBoundsSelector}
                style='warning'
                >
                <Icon type='stop' /> Stop editing bounds
                </Button>
              : <Button
                disabled={disableInputs}
                block
                onClick={this._showBoundsSelector}
                style='warning'
                >
                <Icon type='pencil' /> Set custom geographic bounds
                </Button>}
          </div>
        </div>
      </Group>
    )
  }

  render () {
    const {disabled, profileRequest, setProfileRequest, customProfileRequestJson} = this.props
    const {advancedSectionCollapsed} = this.state
    const {
      bikeSpeed,
      maxRides,
      maxBikeTime,
      maxWalkTime,
      monteCarloDraws,
      walkSpeed
    } = profileRequest

    const customProfileRequestJsonFormatted = JSON.stringify(customProfileRequestJson, null, 2) // pretty-print the json

    return (
      <section className='panel panel-default inner-panel advanced-panel'>
        <a
          className='panel-heading clearfix'
          onClick={this._toggleAdvancedCollapsed}
          style={{cursor: 'pointer'}}
          tabIndex={0}
        >
          <Icon type='gear' />
          <strong>Advanced Settings</strong>
          <Icon
            className='pull-right'
            type={advancedSectionCollapsed ? 'caret-right' : 'caret-down'}
            />
        </a>
        {!advancedSectionCollapsed &&
          <div className='panel-body'>
            <div className='row'>
              <div className='col-xs-4'>
                <EgressModeSelector
                  disabled={disabled}
                  egressModes={profileRequest.transitModes !== ''
                    ? profileRequest.egressModes
                    : profileRequest.directModes}
                  update={setProfileRequest}
                />
              </div>
              <div className='col-xs-4'>
                <InputNumber
                  disabled={disabled}
                  label='Walk Speed (km/h)'
                  value={Math.round(walkSpeed * 36) / 10}
                  min={3}
                  max={15}
                  step={0.1}
                  name='walkSpeed'
                  onChange={this.setWalkSpeed}
                />
              </div>
              <div className='col-xs-4'>
                <InputNumber
                  disabled={disabled}
                  label='Bike Speed (km/h)'
                  value={Math.round(bikeSpeed * 36) / 10}
                  min={5}
                  max={20}
                  step={0.1}
                  name='bikeSpeed'
                  onChange={this.setBikeSpeed}
                />
              </div>
            </div>
            <div className='row'>
              <div className='col-xs-4' />
              <div className='col-xs-4'>
                <InputNumber
                  disabled={disabled}
                  label='Max Walk Time (min)'
                  value={maxWalkTime}
                  min={1}
                  step={1}
                  name='maxWalkTime'
                  onChange={this.setMaxWalkTime}
                />
              </div>
              <div className='col-xs-4'>
                <InputNumber
                  disabled={disabled}
                  label='Max Bike Time (min)'
                  value={maxBikeTime}
                  min={1}
                  step={1}
                  name='maxBikeTime'
                  onChange={this.setMaxBikeTime}
                />
              </div>
            </div>
            <div className='row'>
              <div className='col-xs-6'>
                <InputNumber
                  disabled={disabled}
                  label={messages.analysis.transfers}
                  value={maxRides - 1} // convert max rides to max transfers
                  min={0}
                  max={7}
                  step={1}
                  name='maxTransfers'
                  onChange={this.setMaxTransfers}
                />
              </div>
              <div className='col-xs-6'>
                <InputNumber
                  disabled={disabled}
                  label={messages.analysis.monteCarloDraws}
                  name='monteCarloDraws'
                  value={monteCarloDraws}
                  min={1}
                  max={10000}
                  step={1}
                  onChange={this.setMonteCarloDraws}
                />
              </div>
            </div>
            {this.renderRegionalAnalysisBoundsSelector(disabled)}
            <div className='row'>
              <div className='col-xs-12'>
                <TextArea
                  label={messages.analysis.customProfileRequestJson}
                  name='customProfileRequestJson'
                  value={customProfileRequestJsonFormatted}
                  onChange={this._setCustomProfileRequestJson}
                  width="80"
                  height="10"
                  />
              </div>
            </div>
          </div>
        }
      </section>
    )
  }
}

function boundsEqual (b0: Bounds, b1: Bounds, epsilon: number = 1e-6) {
  return (
    Math.abs(b0.north - b1.north) < epsilon &&
    Math.abs(b0.west - b1.west) < epsilon &&
    Math.abs(b0.east - b1.east) < epsilon &&
    Math.abs(b0.south - b1.south) < epsilon
  )
}

/** Convert web mercator bounds from a regional analysis to geographic bounds */
function webMercatorBoundsToGeographic ({
  north,
  west,
  width,
  height,
  zoom
}: {
  north: number,
  west: number,
  height: number,
  width: number,
  zoom: number
}): Bounds {
  const nw = LeafletMap.prototype.unproject([west + 1, north], zoom)
  const se = LeafletMap.prototype.unproject(
    [west + width + 1, north + height],
    zoom
  )
  return {
    east: se.lng,
    north: nw.lat,
    south: se.lat,
    west: nw.lng
  }
}
