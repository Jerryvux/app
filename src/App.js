// App.js
import AppNavigator from './navigation/AppNavigator';
import { ProductsProvider } from './context/ProductsContext';

export default function App() {
  return (
    <ProductsProvider>
      <AppNavigator />
    </ProductsProvider>
  );
}
