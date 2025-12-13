// Type definitions for react-native-markdown-display
declare module "react-native-markdown-display" {
  import { Component } from "react"
  import { StyleProp, TextStyle, ViewStyle } from "react-native"

  export interface MarkdownStyles {
    [key: string]: StyleProp<ViewStyle | TextStyle>
  }

  export interface MarkdownProps {
    children: string
    style?: MarkdownStyles
    rules?: any
    mergeStyle?: boolean
    debugPrintTree?: boolean
  }

  export default class Markdown extends Component<MarkdownProps> {}
}
