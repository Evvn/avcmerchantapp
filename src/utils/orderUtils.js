import _ from 'lodash';
import dayjs from 'dayjs';

import Airtable from "../data/airtable";
import Orders from "../data/orders";
import Items from "../data/items";
import Addons from "../data/addons";

export const mapOrdersToData = (data) => {
    const { orders, addons, items} = data;
    return sortOrders(orders.map(order => {
      const { item_id: [itemId], addons, quantity } = order;
      return {
        ...order,
        ...{
        items: items.find(item => item.id === itemId),
        addons: (addons || []).map(addonId => {
          return addons.find(addon => addon.id === addonId);
        }),
        quantity
      }};
    }));
};

export const sortByTime = (orders) =>{
    return orders.sort((a, b) => {
        // Sorts the completed orders by the completed_time field
        const firstItem = dayjs(
          a.completed_time ? a.completed_time : a.created_time
        );
        const secondItem = dayjs(
          b.completed_time ? b.completed_time : b.created_time
        );

        if (firstItem.isBefore(secondItem)) {
          return 1;
        }

        if (firstItem.isAfter(secondItem)) {
          return -1;
        }

        // The dates are the same
        return 0;
      });
}


export const sortOrders = (orders) => {
    const pending = sortByTime(orders.filter(order => !order.processed && !order.order_is_ready));
    const ready = sortByTime(orders.filter(order => order.processed && !order.order_is_ready));
    const completed = sortByTime(orders.filter(order => !!order.order_is_ready));

    return { pending, ready, completed };
      
}

export const airtableFetch = async () => {
    const venueName = "Hopscotch";
    const orderState = {}
    await Airtable.fetchBase({
      venueName,
      baseName: "Orders"
    }).then(response => {
      Orders.setAll({
        venueName,
        items: response
      });
      const currentOrders = Orders.getAll("Hopscotch");
      orderState.orders = currentOrders;
    });

    /**
     * Get all current available items to map with the order.
     */
    await Airtable.fetchBase({
      venueName,
      baseName: "Database"
    }).then(response => {
      Items.setAll({
        items: response.map(Airtable.mapItemColumns),
        venueName
      });
      const currentItems = Items.getAll("Hopscotch");
      orderState.items = currentItems;
    });

    /**
     * Get all current available items to map with the order.
     */
    await Airtable.fetchBase({
      venueName,
      baseName: "Add-On by Group"
    }).then(response => {
      Addons.setAll({
        addons: response.map(Airtable.mapAddonColumns),
        venueName
      });
      const currentAddons = Addons.getAll("Hopscotch");
      orderState.addons = currentAddons;
    });

    return orderState;
}