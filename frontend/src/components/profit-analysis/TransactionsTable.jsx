"use client"

import "../../styles/profit-analysis/TransactionsTable.css"

const TransactionsTable = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <div className="no-data">No transaction data available</div>
  }

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="transactions-table-container">
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Item</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className={transaction.type === "sale" ? "sale-row" : "restock-row"}>
              <td>
                <div className="date-time">
                  <span className="date">{formatDate(transaction.date)}</span>
                  <span className="time">{formatTime(transaction.date)}</span>
                </div>
              </td>
              <td>{transaction.itemName}</td>
              <td>
                <span className={`transaction-type ${transaction.type}`}>
                  {transaction.type === "sale" ? "Sale" : "Restock"}
                </span>
              </td>
              <td>{transaction.quantitySold}</td>
              <td className="amount">{transaction.type === "sale" ? `₹${transaction.revenue.toFixed(2)}` : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TransactionsTable
