import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";

const ChartCard = ({ data }) => {
  const chartData = [
    { name: "Transport", value: data?.transport || 0 },
    { name: "Electricity", value: data?.electricity || 0 },
    { name: "Water", value: data?.water || 0 },
    { name: "Food", value: data?.food || 0 },
    { name: "Waste", value: data?.waste || 0 }
  ];

  const colors = [
    "#16a34a",
    "#2563eb",
    "#eab308",
    "#f97316",
    "#9333ea"
  ];

  return (
    <div className="dashboard-card">
      <h2>Carbon Emission Chart</h2>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {chartData.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={colors[index]}
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartCard;