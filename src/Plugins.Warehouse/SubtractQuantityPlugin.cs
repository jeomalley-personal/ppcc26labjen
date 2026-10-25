using System;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using TALXIS.DevKit.Build.Dataverse.Plugin;

namespace Plugins.Warehouse
{
    [PluginStep("Create", "lab_warehousetransaction", PluginStage.PostOperation)]
    public class SubtractQuantityPlugin : PluginBase
    {
        public SubtractQuantityPlugin() : base(typeof(SubtractQuantityPlugin))
        {
        }

        public SubtractQuantityPlugin(string unsecureConfiguration, string secureConfiguration)
            : this()
        {
        }

        protected override void ExecuteDataversePlugin(ILocalPluginContext localPluginContext)
        {
            if (localPluginContext == null)
            {
                throw new ArgumentNullException(nameof(localPluginContext));
            }

            var context = localPluginContext.PluginExecutionContext;
            if (!context.InputParameters.Contains("Target") ||
                !(context.InputParameters["Target"] is Entity target) ||
                target.LogicalName != "lab_warehousetransaction")
            {
                return;
            }

            if (!target.Contains("lab_quantity") ||
                !target.Contains("lab_itemid") ||
                !target.Contains("lab_transactiontype"))
            {
                return;
            }

            var transactionType = target.GetAttributeValue<OptionSetValue>("lab_transactiontype");
            var itemReference = target.GetAttributeValue<EntityReference>("lab_itemid");
            if (transactionType == null || itemReference == null)
            {
                return;
            }

            var quantity = target.GetAttributeValue<int>("lab_quantity");
            var service = localPluginContext.OrgSvcFactory.CreateOrganizationService(context.UserId);
            var item = service.Retrieve(
                "lab_warehouseitem",
                itemReference.Id,
                new ColumnSet("lab_availablequantity"));
            var available = item.GetAttributeValue<int>("lab_availablequantity");

            int updatedQuantity;
            if (transactionType.Value == 100000000)
            {
                updatedQuantity = available + quantity;
            }
            else if (transactionType.Value == 100000001)
            {
                updatedQuantity = available - quantity;
            }
            else
            {
                return;
            }

            var itemUpdate = new Entity("lab_warehouseitem", itemReference.Id)
            {
                ["lab_availablequantity"] = updatedQuantity
            };
            service.Update(itemUpdate);
        }
    }
}