"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
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

        // For demo purposes, generate mock sales data if none exists
        // In a real app, you would fetch this from a sales collection
        const mockSalesData = generateMockSalesData(inventoryItems, start);
        setSalesData(mockSalesData);

        // Generate mock transactions
        const mockTransactions = generateMockTransactions(
          inventoryItems,
          start
        );
        setTransactions(mockTransactions);

        // Calculate metrics
        calculateMetrics(mockSalesData, inventoryItems);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load analytics data");
      }

      setLoading(false);
    };

    fetchData();
  }, [currentUser, timeFilter]);

  // Generate mock sales data for demonstration
  const generateMockSalesData = (items, startDate) => {
    if (!items.length) return [];

    const salesData = [];
    const endDate = new Date();
    const currentDate = new Date(startDate);

    // Generate daily sales data
    while (currentDate <= endDate) {
      const dailySales = {
        date: new Date(currentDate),
        totalRevenue: 0,
        totalProfit: 0,
        itemsSold: [],
      };

      // Generate random sales for each item
      items.forEach((item) => {
        const quantitySold = Math.floor(Math.random() * 5); // 0-4 items sold per day
        if (quantitySold > 0) {
          const revenue = quantitySold * item.price;
          const profit = revenue * 0.3; // Assume 30% profit margin

          dailySales.totalRevenue += revenue;
          dailySales.totalProfit += profit;
          dailySales.itemsSold.push({
            itemId: item.id,
            name: item.name,
            quantitySold,
            revenue,
            profit,
            imageUrl: item.imageUrl,
          });
        }
      });

      salesData.push(dailySales);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return salesData;
  };

  // Generate mock transactions for demonstration
  const generateMockTransactions = (items, startDate) => {
    if (!items.length) return [];

    const transactions = [];
    const endDate = new Date();
    const currentDate = new Date(startDate);

    // Generate 15 random transactions
    for (let i = 0; i < 15; i++) {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      const randomDate = new Date(
        startDate.getTime() +
          Math.random() * (endDate.getTime() - startDate.getTime())
      );
      const quantitySold = Math.floor(Math.random() * 5) + 1; // 1-5 items

      transactions.push({
        id: `trans-${i}`,
        itemId: randomItem.id,
        itemName: randomItem.name,
        quantitySold,
        revenue: quantitySold * randomItem.price,
        date: randomDate,
        type: Math.random() > 0.3 ? "sale" : "restock", // 70% sales, 30% restocks
      });
    }

    // Sort by date, newest first
    return transactions.sort((a, b) => b.date - a.date);
  };

  // Calculate metrics from sales data
  const calculateMetrics = (salesData, inventoryItems) => {
    // Calculate total revenue and profit
    let totalRev = 0;
    let totalProfit = 0;
    const itemSalesMap = new Map();

    salesData.forEach((day) => {
      totalRev += day.totalRevenue;
      totalProfit += day.totalProfit;

      day.itemsSold.forEach((item) => {
        if (itemSalesMap.has(item.itemId)) {
          const existing = itemSalesMap.get(item.itemId);
          itemSalesMap.set(item.itemId, {
            ...existing,
            quantitySold: existing.quantitySold + item.quantitySold,
            revenue: existing.revenue + item.revenue,
            profit: existing.profit + item.profit,
          });
        } else {
          itemSalesMap.set(item.itemId, {
            itemId: item.itemId,
            name: item.name,
            quantitySold: item.quantitySold,
            revenue: item.revenue,
            profit: item.profit,
            imageUrl: item.imageUrl,
          });
        }
      });
    });

    setTotalRevenue(totalRev);
    setEstimatedProfit(totalProfit);

    // Find best selling and slow moving items
    if (itemSalesMap.size > 0) {
      const itemSalesArray = Array.from(itemSalesMap.values());

      // Sort by quantity sold (descending)
      const sortedItems = [...itemSalesArray].sort(
        (a, b) => b.quantitySold - a.quantitySold
      );

      setBestSellingItem(sortedItems[0] || null);
      setSlowMovingItem(sortedItems[sortedItems.length - 1] || null);

      // Get top 5 selling items
      setTopSellingItems(sortedItems.slice(0, 5));
    }

    // Generate insights
    generateInsights(salesData, itemSalesMap);
  };

  // Generate business insights
  const generateInsights = (salesData, itemSalesMap) => {
    const insights = [];

    // Compare recent sales with previous period
    if (salesData.length > 0) {
      const midpoint = Math.floor(salesData.length / 2);
      const recentPeriod = salesData.slice(midpoint);
      const previousPeriod = salesData.slice(0, midpoint);

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
    const lowStockItems = inventoryData.filter((item) => item.quantity < 5);
    if (lowStockItems.length > 0) {
      insights.push(
        `You have ${lowStockItems.length} items with low stock. Consider restocking soon.`
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
              imageUrl={bestSellingItem?.imageUrl}
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
