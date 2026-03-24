import { useEffect } from "react";
import { getItems } from "../../services/item/itemApi"; // your file path

function TestApi() {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getItems();
        console.log("API SUCCESS:", res.data);
      } catch (error) {
        console.error("API ERROR:", error);
      }
    };

    fetchData();
  }, []);

  return <h1>Check Console (F12)</h1>;
}

export default TestApi;
