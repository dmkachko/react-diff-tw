import {DifflTw} from "lib/src/components/diffl-tw.tsx";

const oldValue = JSON.stringify({
    a: 1, b: 2, c: 3,
    d: {
        e: {
            a: 'dfsdfghjghj fgh456fg1h 123345 ', b: 2, c: 3,
            a1: 'dfsdfghjghj fgh456fg1h 123345 ', b1: 2, c1: 3,
            a2: 'dfsdfghjghj fgh456fg1h 123345 ', b2: 2, c2: 3,
            a3: 'dfsdfghjghj fgh456fg1h 123345 ', b3: 2, c3: 3
        }
    }
}, null, 2)
const newValue = JSON.stringify({
    a: 1, b: 3, c: 3,
    d: {
        e: {
            a: 'dfsdfghjghj fghfghfg1h 123345 ', b: 4, c: 3,
            a1: 'dfsdfghjghj fgh456fg1h 123345 ', b1: 2, c1: 3,
            a2: 'dfsdfghjghj fgh456fg1h 123345 ', b2: 2, c2: 3,
            a3: 'dfsdfghjghj fgh456fg1h 123345 ', b3: 2, c3: 3
        }
    },
    d1: {
        e: {
            a: 'dfsdfghjghj fghfghfg1h 123345 ', b: 4, c: 3,
            a1: 'dfsdfghjghj fgh456fg1h 123345 ', b1: 2, c1: 3,
            a2: 'dfsdfghjghj fgh456fg1h 123345 ', b2: 2, c2: 3,
            a3: 'dfsdfghjghj fgh456fg1h 123345 ', b3: 2, c3: 3
        }
    }
}, null, 2)

function App() {
    return (
        <div className={'w-full h-auto bg-amber-50 text-gray-700'}>
            <DifflTw oldValue={oldValue} newValue={newValue} styles={{}}/>
        </div>
    )
}

export default App
