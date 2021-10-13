import React from 'react'
import { storiesOf } from '@storybook/react-native'
import { action } from '@storybook/addon-actions'
import { text } from '@storybook/addon-knobs'
import { Text } from 'react-native'
import { Test } from './apps/components/interface/test'

storiesOf('Button', module)
  .add('with text', () => (
    <Test onPress={action('clicked-text')}>
      <Text>{text('Button text', 'Hello Button')}</Text>
    </Test>
  ))
  .add('with some emoji', () => (
    <Test onPress={action('clicked-emoji')}>
      <Text>😀 😎 👍 💯</Text>
    </Test>
  ))