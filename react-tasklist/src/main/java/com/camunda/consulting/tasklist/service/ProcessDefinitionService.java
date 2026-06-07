package com.camunda.consulting.tasklist.service;

import com.camunda.consulting.tasklist.model.ProcessDefinitionDto;
import com.camunda.consulting.tasklist.model.StartProcessResponse;
import io.camunda.client.CamundaClient;
import io.camunda.client.api.response.ProcessInstanceEvent;
import io.camunda.client.api.search.response.ProcessDefinition;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class ProcessDefinitionService {
  private final CamundaClient camundaClient;

  public ProcessDefinitionService(CamundaClient camundaClient) {
    this.camundaClient = camundaClient;
  }

  public List<ProcessDefinitionDto> getStartableProcessDefinitions() {
    return camundaClient
        .newProcessDefinitionSearchRequest()
        .filter(filter -> filter.isLatestVersion(true))
        .sort(sort -> sort.name().asc())
        .page(page -> page.from(0).limit(100))
        .execute()
        .items()
        .stream()
        .map(this::map)
        .toList();
  }

  public StartProcessResponse startProcess(String processDefinitionKey, Map<String, Object> variables) {
    long key = parseProcessDefinitionKey(processDefinitionKey);
    ProcessInstanceEvent event =
        camundaClient
            .newCreateInstanceCommand()
            .processDefinitionKey(key)
            .variables(variables == null ? Map.of() : variables)
            .execute();

    return new StartProcessResponse(
        String.valueOf(event.getProcessDefinitionKey()),
        event.getBpmnProcessId(),
        event.getVersion(),
        String.valueOf(event.getProcessInstanceKey()),
        event.getTenantId());
  }

  private ProcessDefinitionDto map(ProcessDefinition processDefinition) {
    return new ProcessDefinitionDto(
        String.valueOf(processDefinition.getProcessDefinitionKey()),
        processDefinition.getProcessDefinitionId(),
        processDefinition.getName(),
        processDefinition.getResourceName(),
        processDefinition.getVersion(),
        processDefinition.getTenantId(),
        processDefinition.getHasStartForm());
  }

  private long parseProcessDefinitionKey(String processDefinitionKey) {
    if (processDefinitionKey == null || processDefinitionKey.isBlank()) {
      throw new IllegalArgumentException("processDefinitionKey is required.");
    }

    try {
      return Long.parseLong(processDefinitionKey);
    } catch (NumberFormatException e) {
      throw new IllegalArgumentException("processDefinitionKey must be a numeric Camunda key.", e);
    }
  }
}
