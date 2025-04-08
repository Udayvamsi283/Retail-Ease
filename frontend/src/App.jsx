import AddItemForm from "./components/AddItemForm";
import InventoryList from "./components/InventoryList";

function App() {
  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Retail Ease</h1>
      <AddItemForm />
      <hr className="my-4" />
      <InventoryList />
    </div>
  );
}

export default App;
