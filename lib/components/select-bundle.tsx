import {FormControl, FormLabel} from '@chakra-ui/react'
import get from 'lodash/fp/get'
import {useState} from 'react'

import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'

import Select from './select'

const getOptionLabel = (b: CL.Bundle) =>
  `${b.name}${b.status === 'DONE' ? '' : `: ${b.status}`}`

export default function SelectBundle({
  bundles,
  query
}: {
  bundles: CL.Bundle[]
  query: Record<string, string>
}) {
  const [bundleId, setBundleId] = useState(query.bundleId)
  const goToBundleEdit = useRouteTo('bundleEdit', {regionId: query.regionId})

  function selectBundle(result: CL.Bundle) {
    setBundleId(result._id)
    goToBundleEdit({bundleId: result._id})
  }

  return (
    <FormControl>
      <FormLabel htmlFor='selectBundle' textAlign='center'>
        {message('bundle.select')}
      </FormLabel>
      <div>
        <Select
          inputId='selectBundle'
          options={bundles}
          getOptionLabel={getOptionLabel}
          getOptionValue={get('_id')}
          onChange={selectBundle}
          value={bundles.find((b) => b._id === bundleId)}
        />
      </div>
    </FormControl>
  )
}
