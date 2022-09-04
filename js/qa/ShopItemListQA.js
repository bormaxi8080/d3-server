var ShopItemListQA = {};

ShopItemListQA.handle = function() {
    var res = [];
    var products = context.defs.get_def("products");
    for (var product_id in products) {
        var product = products[product_id];
        res.push({
            name: product_id,
            type: product.group,
            flag: product.presentation.flag || "",
            value: product.presentation.base_value,
            bonus: (product.presentation.bonus ? "+ " + product.presentation.bonus + "%" : ""),
            totalValue: product.presentation.total_value
        });
    }
    return res;
};
