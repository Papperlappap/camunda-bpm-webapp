define([
  'text!./process-definitions.html'
], function(
  template
) {
  'use strict';

  return [ 'ViewsProvider', function (ViewsProvider) {
    ViewsProvider.registerDefaultView('cockpit.dashboard', {
      id: 'process-definition',
      label: 'Deployed Process Definitions',
      dashboardMenuLabel: 'BPMN Processes',
      template: template,
      controller: [
              '$scope',
              'Views',
              'camAPI',
      function($scope, Views, camAPI) {
        var processInstancePlugins = Views.getProviders({ component: 'cockpit.processInstance.view' });
        $scope.hasHistoryPlugin = processInstancePlugins.filter(function(plugin) {
          return plugin.id === 'history';
        }).length > 0;

        var processData = $scope.processData.newChild($scope);

        $scope.orderByPredicate = 'definition.name';
        $scope.orderByReverse = false;

        var processDefinitionService = camAPI.resource('process-definition');

        processDefinitionService.list({
          latest: true
        }, function(err, data) {
          $scope.processDefinitionData = data.items;

          processData.observe('processDefinitionStatistics', function (processDefinitionStatistics) {
            $scope.statistics = processDefinitionStatistics;

            $scope.statistics.forEach(function(statistic) {
              var processDefId = statistic.definition.id;
              var foundIds = $scope.processDefinitionData.filter(function(pd) {
                return pd.id === processDefId;
              });

              var foundObject = foundIds[0];
              if(!!foundObject) {
                foundObject.incidents = statistic.incidents;
                foundObject.instances = statistic.instances;
              }
            })
          });
        });

        $scope.selected = 'list';
        $scope.selectTab = function (which) {
          $scope.selected = which;
        };
      }],

      priority: 0
    });
  }];
});
