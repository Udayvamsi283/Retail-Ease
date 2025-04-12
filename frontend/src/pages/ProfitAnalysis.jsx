"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase/config";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import MetricCard from "../components/profit-analysis/MetricCard";
import SalesChart from "../components/profit-analysis/SalesChart";
import TopSellingItems from "../components/profit-analysis/TopSellingItems";
import TransactionsTable from "../components/profit-analysis/TransactionsTable";
import BusinessInsights from "../components/profit-analysis/BusinessInsights";
import FilterControls from "../components/profit-analysis/FilterControls";
import {
  FaRupeeSign,
  FaChartLine,
  FaBoxOpen,
  FaExclamationTriangle,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import "../styles/ProfitAnalysis.css";

const ProfitAnalysis = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeFilter, setTimeFilter] = useState("month"); // week, month, quarter
  const [viewMode, setViewMode] = useState("revenue"); // revenue, profit

  // Data states
  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Metrics states
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [estimatedProfit, setEstimatedProfit] = useState(0);
  const [bestSellingItem, setBestSellingItem] = useState(null);
  const [slowMovingItem, setSlowMovingItem] = useState(null);
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [insights, setInsights] = useState([]);

  // Get date range based on filter
  const getDateRange = () => {
    const now = new Date();
    const end = now;
    const start = new Date();

    if (timeFilter === "week") {
      start.setDate(now.getDate() - 7);
    } else if (timeFilter === "month") {
      start.setMonth(now.getMonth() - 1);
    } else if (timeFilter === "quarter") {
      start.setMonth(now.getMonth() - 3);
    }

    return { start, end };
  };

  // Fetch data from Firestore
  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const { start } = getDateRange();

        // Fetch inventory items
        const inventoryRef = collection(db, "inventory");
        const inventoryQuery = query(
          inventoryRef,
          where("userId", "==", currentUser.uid)
        );

        const inventorySnapshot = await getDocs(inventoryQuery);
        const inventoryItems = [];

        inventorySnapshot.forEach((doc) => {
          inventoryItems.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setInventoryData(inventoryItems);

        // Fetch receipts
        const receiptsRef = collection(db, "receipts");
        const receiptsQuery = query(
          receiptsRef,
          where("userId", "==", currentUser.uid),
          where("timestamp", ">=", start),
          orderBy("timestamp", "desc")
        );

        const receiptsSnapshot = await getDocs(receiptsQuery);
        const receipts = [];

        receiptsSnapshot.forEach((doc) => {
          const data = doc.data();
          receipts.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date(),
          });
        });

        // Process receipts into sales data
        const salesByDate = {};
        const itemSales = {};
        const transactionsList = [];

        receipts.forEach((receipt) => {
          // Format date for grouping
          const dateKey = receipt.timestamp.toISOString().split("T")[0];

          // Initialize sales data for this date if it doesn't exist
          if (!salesByDate[dateKey]) {
            salesByDate[dateKey] = {
              date: new Date(dateKey),
              totalRevenue: 0,
              totalProfit: 0,
              itemsSold: [],
            };
          }

          // Add receipt total to daily revenue
          salesByDate[dateKey].totalRevenue += receipt.total;

          // Process items in receipt
          receipt.items.forEach((item) => {
            // Find the inventory item to get cost price
            const inventoryItem = inventoryItems.find(
              (invItem) => invItem.id === item.id
            );
            const costPrice = inventoryItem?.costPrice || item.price * 0.7; // Default to 30% margin if not found
            const profit = (item.price - costPrice) * item.quantity;

            // Add profit to daily total
            salesByDate[dateKey].totalProfit += profit;

            // Add to daily items sold
            salesByDate[dateKey].itemsSold.push({
              itemId: item.id,
              name: item.name,
              quantitySold: item.quantity,
              revenue: item.subtotal,
              profit: profit,
            });

            // Track total sales by item
            if (!itemSales[item.id]) {
              itemSales[item.id] = {
                itemId: item.id,
                name: item.name,
                quantitySold: 0,
                revenue: 0,
                profit: 0,
              };
            }
            itemSales[item.id].quantitySold += item.quantity;
            itemSales[item.id].revenue += item.subtotal;
            itemSales[item.id].profit += profit;
          });

          // Add to transactions list
          transactionsList.push({
            id: receipt.id,
            date: receipt.timestamp,
            items: receipt.items,
            total: receipt.total,
            type: "sale",
          });
        });

        // Convert salesByDate object to array
        const salesDataArray = Object.values(salesByDate);
        setSalesData(salesDataArray);
        setTransactions(transactionsList);

        // Calculate metrics
        calculateMetrics(salesDataArray, itemSales, inventoryItems);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load analytics data");
      }

      setLoading(false);
    };

    fetchData();
  }, [currentUser, timeFilter]);

  // Calculate metrics from sales data
  const calculateMetrics = (salesData, itemSales, inventoryItems) => {
    // Calculate total revenue and profit
    let totalRev = 0;
    let totalProfit = 0;

    salesData.forEach((day) => {
      totalRev += day.totalRevenue;
      totalProfit += day.totalProfit;
    });

    setTotalRevenue(totalRev);
    setEstimatedProfit(totalProfit);

    // Find best selling and slow moving items
    const itemSalesArray = Object.values(itemSales);

    if (itemSalesArray.length > 0) {
      // Sort by quantity sold (descending)
      const sortedItems = [...itemSalesArray].sort(
        (a, b) => b.quantitySold - a.quantitySold
      );

      // Find best selling item
      setBestSellingItem(sortedItems[0] || null);

      // Find slow moving item
      setSlowMovingItem(sortedItems[sortedItems.length - 1] || null);

      // Get top 5 selling items
      setTopSellingItems(sortedItems.slice(0, 5));
    } else {
      setBestSellingItem(null);
      setSlowMovingItem(null);
      setTopSellingItems([]);
    }

    // Generate insights
    generateInsights(salesData, itemSalesArray, inventoryItems);
  };

  // Generate business insights
  const generateInsights = (salesData, itemSalesArray, inventoryItems) => {
    const insights = [];

    // Compare recent sales with previous period
    if (salesData.length > 0) {
      const midpoint = Math.floor(salesData.length / 2);
      const recentPeriod = salesData.slice(0, midpoint);
      const previousPeriod = salesData.slice(midpoint);

      const recentRevenue = recentPeriod.reduce(
        (sum, day) => sum + day.totalRevenue,
        0
      );
      const previousRevenue = previousPeriod.reduce(
        (sum, day) => sum + day.totalRevenue,
        0
      );

      if (previousRevenue > 0) {
        const percentChange =
          ((recentRevenue - previousRevenue) / previousRevenue) * 100;

        if (percentChange > 0) {
          insights.push(
            `Your sales increased by ${percentChange.toFixed(
              1
            )}% compared to the previous period.`
          );
        } else if (percentChange < 0) {
          insights.push(
            `Your sales decreased by ${Math.abs(percentChange).toFixed(
              1
            )}% compared to the previous period.`
          );
        } else {
          insights.push(
            "Your sales remained stable compared to the previous period."
          );
        }
      }
    }

    // Best selling item insight
    if (bestSellingItem) {
      insights.push(
        `${bestSellingItem.name} is your best-selling product with ${bestSellingItem.quantitySold} units sold.`
      );
    }

    // Low stock warning (using inventory data)
    const lowStockItems = inventoryItems.filter((item) => item.quantity < 5);
    if (lowStockItems.length > 0) {
      insights.push(
        `You have ${lowStockItems.length} items with low stock. Consider restocking soon.`
      );
    }

    // Average transaction value
    if (transactions.length > 0) {
      const avgValue = totalRevenue / transactions.length;
      insights.push(
        `Your average transaction value is ₹${avgValue.toFixed(2)}.`
      );
    }

    setInsights(insights);
  };

  // Toggle between revenue and profit view
  const toggleViewMode = () => {
    setViewMode(viewMode === "revenue" ? "profit" : "revenue");
  };

  return (
    <div className="profit-analysis-page">
      <div className="page-header">
        <h1 className="page-title">Profit Analysis</h1>

        <div className="view-toggle" onClick={toggleViewMode}>
          <span>View: {viewMode === "revenue" ? "Revenue" : "Profit"}</span>
          {viewMode === "revenue" ? (
            <FaToggleOn className="toggle-icon" />
          ) : (
            <FaToggleOff className="toggle-icon" />
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <FilterControls
        currentFilter={timeFilter}
        onFilterChange={setTimeFilter}
      />

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      ) : (
        <>
          <section className="metrics-section">
            <MetricCard
              title="Total Revenue"
              value={totalRevenue}
              icon={<FaRupeeSign />}
              color="primary"
              isCurrency={true}
              altValue={viewMode === "profit" ? estimatedProfit : null}
              altLabel={viewMode === "profit" ? "Profit" : null}
            />

            <MetricCard
              title="Estimated Profit"
              value={estimatedProfit}
              icon={<FaChartLine />}
              color="highlight"
              isCurrency={true}
              altValue={
                viewMode === "profit"
                  ? ((estimatedProfit / totalRevenue) * 100).toFixed(1) + "%"
                  : null
              }
              altLabel={viewMode === "profit" ? "Margin" : null}
            />

            <MetricCard
              title="Best-Selling Item"
              value={bestSellingItem?.name || "N/A"}
              subvalue={
                bestSellingItem ? `${bestSellingItem.quantitySold} units` : ""
              }
              icon={<FaBoxOpen />}
              color="secondary"
            />

            <MetricCard
              title="Slow-Moving Item"
              value={slowMovingItem?.name || "N/A"}
              subvalue={
                slowMovingItem ? `${slowMovingItem.quantitySold} units` : ""
              }
              icon={<FaExclamationTriangle />}
              color="accent"
            />
          </section>

          <BusinessInsights insights={insights} />

          <section className="charts-section">
            <div className="chart-container">
              <h2 className="section-title">Sales Trends</h2>
              <SalesChart salesData={salesData} viewMode={viewMode} />
            </div>

            <div className="chart-container">
              <h2 className="section-title">Top Selling Items</h2>
              <TopSellingItems items={topSellingItems} viewMode={viewMode} />
            </div>
          </section>

          <section className="transactions-section">
            <h2 className="section-title">Recent Transactions</h2>
            <TransactionsTable transactions={transactions} />
          </section>
        </>
      )}
    </div>
  );
};

export default ProfitAnalysis;
