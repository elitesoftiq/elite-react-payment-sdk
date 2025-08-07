
import './App.css'
import './assets/scss/styles.scss'
import { PaymentTestForm } from './example';
import { WebPaymentSDK } from './sdk'
import { QueryClientProvider } from '@tanstack/react-query';
import { tanstackQueryClient } from './sdk/lib/react-query';


function App() {

  return (
    <>
      {/* <WebPaymentSDK
        config={{
          mode: "fullscreen",
          language: "en",
          onComplete: (paymentData) => {
            console.log('Payment completed with data:', paymentData);
          },
          onClose: () => {},
          paymentInfo: {
            total: 100,
            breakdown: {
              items: 100,
              discount: 10,
            },
          },
        }}
      /> */}
<QueryClientProvider client={tanstackQueryClient}>
<PaymentTestForm /> 
</QueryClientProvider>
    </>
  )
}

export default App
