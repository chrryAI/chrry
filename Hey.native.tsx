import Home from "./Home"
import {
  CustomNavigator,
  Screen,
  Screens,
} from "./platform/CustomNavigator.native"
import Thread from "./Thread"

// Native version uses custom navigator - no React Navigation Stack needed
export const Hey = (props: any) => {
  return (
    <CustomNavigator initialRouteName="home">
      <Screens>
        <Screen name="home" component={Home} />
        <Screen name="thread" component={Thread} />
      </Screens>
    </CustomNavigator>
  )
}
