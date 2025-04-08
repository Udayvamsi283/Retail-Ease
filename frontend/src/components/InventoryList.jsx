import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const InventoryList = () => {
  const [inventory, setInventory] = useState([]);

  const fetchInventory = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "inventory"));
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setInventory(items);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "inventory", id));
      setInventory(inventory.filter((item) => item.id !== id)); // Update state
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleEdit = (item) => {
    // For now, just log the item. We'll implement editing soon.
    console.log("Edit item:", item);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Inventory List</h2>
      <ul className="space-y-4">
        {inventory.map((item) => (
          <li
            key={item.id}
            className="bg-white p-4 rounded shadow flex justify-between items-center"
          >
            <div>
              <div>
                <strong>Name:</strong> {item.name}
              </div>
              <div>
                <strong>Quantity:</strong> {item.quantity}
              </div>
              <div>
                <strong>Price:</strong> ₹{item.price}
              </div>
              {item.expiryDate && (
                <div>
                  <strong>Expiry:</strong> {item.expiryDate}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(item)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InventoryList;
