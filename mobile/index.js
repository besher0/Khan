import { AppRegistry } from 'react-native';
import App from './App.jsx';

AppRegistry.registerComponent('KhanInterfaces', () => App);
AppRegistry.runApplication('KhanInterfaces', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
