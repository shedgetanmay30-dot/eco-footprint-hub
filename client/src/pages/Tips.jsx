import { useEffect, useState } from "react";
import API from "../services/api";

const Tips = () => {
  const [tips, setTips] = useState([]);

  useEffect(() => {
    API.get("/tips")
      .then((response) => setTips(response.data.tips))
      .catch((error) => console.log(error));
  }, []);

  return (
    <div className="container">
      <h1>Eco-Friendly Tips 🌿</h1>

      {tips.map((tip) => (
        <div className="dashboard-card" key={tip._id}>
          <h2>{tip.title}</h2>
          <p>{tip.description}</p>
          <p>Category: {tip.category}</p>
        </div>
      ))}
    </div>
  );
};

export default Tips;