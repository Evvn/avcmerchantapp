import Airtable from "airtable";

const API_KEY = process.env.REACT_APP_AIRTABLE_API_KEY;
Airtable.configure({
  apiKey: API_KEY,
  endpointUrl: "https://api.airtable.com"
});
const base = Airtable.base("app4XnP7NuSCWMWD7");

const fetchBase = ({ venueName, baseName }) => {
  return new Promise((resolve, reject) => {
    let results = [];
    base(baseName)
      .select({
        view: "Grid view"
      })
      .eachPage(
        function page(records, fetchNextPage) {
          // This function (`page`) will get called for each page of records.
          if (!records.length) {
            return;
          }

          results = results.concat(records.map(record => mapColumns(record)));
          fetchNextPage();
        },
        function(error) {
          if (error) {
            return reject(error);
          }

          resolve(results);
        }
      );
  });
};

const mapColumns = record => {
  const { id, fields, ...rest } = record;
  return {
    id,
    ...fields,
    ...rest
  };
};

const mapItemColumns = record => {
  const priceValue = record["price_discounted"];
  return {
    id: record.id,
    name: record["Item Name"],
    namefr: record["name-fr"],
    nameel: record["name-el"],
    namezhcn: record["name-zh-CN"],
    namees: record["name-es"],
    nameit: record["name-it"],
    price: priceValue,
    tags: record["Tags"],
    filters: record["Tags Filtering"],
    image: record["Image"],
    description: record["Item Description"],
    descriptionfr: record["description-fr"],
    descriptionel: record["description-el"],
    descriptionzhcn: record["description-zh-CN"],
    descriptiones: record["description-es"],
    descriptionit: record["description-it"],
    imageCredit: record["image credit"],
    sections: record["Sections"],
    category: record["Head Category"],
    addons: record["Add-On Group"]
  };
};

const mapAddonColumns = record => {
  const priceValue = record["price_discounted"];
  return {
    id: record.id,
    name: record["Add-On Name"],
    group: record["Add-On Group"],
    price: Array.isArray(priceValue) ? priceValue[0] : priceValue
  };
};

export default { fetchBase, mapItemColumns, mapAddonColumns };
