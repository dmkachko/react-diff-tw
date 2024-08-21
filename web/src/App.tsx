import {DifflTw} from "lib/src/components/diffl-tw.tsx";

const oldValue = JSON.stringify({a: 1, b: 2, c: 3, d: {e: {a: 1, b: 2, c: 3}}}, null, 2)
const newValue =  JSON.stringify({a: 1, b: 3, c: 3, d: {e: {a: 1, b: 4, c: 3}}}, null, 2)

function App() {
  return (
    <div className={'w-full h-[100vh] bg-amber-50 text-gray-700'}>
        <DifflTw oldValue={oldValue} newValue={newValue} styles={{}}/>
    </div>
  )
}

export default App
