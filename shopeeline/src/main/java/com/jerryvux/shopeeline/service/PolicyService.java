package com.jerryvux.shopeeline.service;

import com.jerryvux.shopeeline.model.Policy;
import java.util.List;

public interface PolicyService {

    List<Policy> getAllPolicies();

    List<Policy> getActivePolicies();

    List<Policy> getPoliciesByType(String type);

    Policy getPolicyById(Integer id);

    Policy createPolicy(Policy policy);

    Policy updatePolicy(Integer id, Policy policy);

    void deletePolicy(Integer id);

    void togglePolicyStatus(Integer id);
}
