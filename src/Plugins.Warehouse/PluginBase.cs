using System;
using Microsoft.Xrm.Sdk;

namespace Plugins.Warehouse
{
    public interface ILocalPluginContext
    {
        IPluginExecutionContext PluginExecutionContext { get; }
        IOrganizationServiceFactory OrgSvcFactory { get; }
        ITracingService TracingService { get; }
    }

    internal sealed class LocalPluginContext : ILocalPluginContext
    {
        public LocalPluginContext(
            IPluginExecutionContext pluginExecutionContext,
            IOrganizationServiceFactory orgSvcFactory,
            ITracingService tracingService)
        {
            PluginExecutionContext = pluginExecutionContext;
            OrgSvcFactory = orgSvcFactory;
            TracingService = tracingService;
        }

        public IPluginExecutionContext PluginExecutionContext { get; }
        public IOrganizationServiceFactory OrgSvcFactory { get; }
        public ITracingService TracingService { get; }
    }

    public abstract class PluginBase : IPlugin
    {
        private readonly Type _pluginType;

        protected PluginBase(Type pluginType)
        {
            _pluginType = pluginType;
        }

        public void Execute(IServiceProvider serviceProvider)
        {
            var tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            try
            {
                var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
                var serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
                ExecuteDataversePlugin(new LocalPluginContext(context, serviceFactory, tracingService));
            }
            catch (Exception exception)
            {
                tracingService.Trace("{0}: {1}", _pluginType.Name, exception);
                throw;
            }
        }

        protected abstract void ExecuteDataversePlugin(ILocalPluginContext localPluginContext);
    }
}
