import { useState } from "react";
import { db } from "../firebase"; // make sure this path matches your config
import { collection, addDoc } from "firebase/firestore";

export default function InventoryForm() {
  const [item, setItem] = useState({
    name: "",
    quantity: "",
    price: "",
    expiry: "",
  });

  const handleChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "inventory"), item);
      alert("Item added!");
      setItem({ name: "", quantity: "", price: "", expiry: "" });
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white rounded shadow max-w-md mx-auto"
    >
      <input
        name="name"
        value={item.name}
        onChange={handleChange}
        placeholder="Item name"
        className="mb-2 p-2 border w-full"
      />
      <input
        name="quantity"
        type="number"
        value={item.quantity}
        onChange={handleChange}
        placeholder="Quantity"
        className="mb-2 p-2 border w-full"
      />
      <input
        name="price"
        type="number"
        value={item.price}
        onChange={handleChange}
        placeholder="Price per unit"
        className="mb-2 p-2 border w-full"
      />
      <input
        name="expiry"
        type="date"
        value={item.expiry}
        onChange={handleChange}
        className="mb-2 p-2 border w-full"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Add Item
      </button>
    </form>
  );
}
