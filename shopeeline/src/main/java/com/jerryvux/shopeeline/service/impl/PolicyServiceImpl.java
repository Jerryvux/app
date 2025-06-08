package com.jerryvux.shopeeline.service.impl;

import com.jerryvux.shopeeline.model.Policy;
import com.jerryvux.shopeeline.repository.PolicyRepository;
import com.jerryvux.shopeeline.service.PolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PolicyServiceImpl implements PolicyService {

    @Autowired
    private PolicyRepository policyRepository;

    @Override
    public List<Policy> getAllPolicies() {
        return policyRepository.findAll();
    }

    @Override
    public List<Policy> getActivePolicies() {
        return policyRepository.findByIsActiveTrue();
    }

    @Override
    public List<Policy> getPoliciesByType(String type) {
        return policyRepository.findByTypeAndIsActiveTrue(type);
    }

    @Override
    public Policy getPolicyById(Integer id) {
        return policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with id: " + id));
    }

    @Override
    public Policy createPolicy(Policy policy) {
        return policyRepository.save(policy);
    }

    @Override
    public Policy updatePolicy(Integer id, Policy policy) {
        Policy existingPolicy = getPolicyById(id);
        existingPolicy.setTitle(policy.getTitle());
        existingPolicy.setContent(policy.getContent());
        existingPolicy.setType(policy.getType());
        existingPolicy.setIsActive(policy.getIsActive());
        return policyRepository.save(existingPolicy);
    }

    @Override
    public void deletePolicy(Integer id) {
        Policy policy = getPolicyById(id);
        policyRepository.delete(policy);
    }

    @Override
    public void togglePolicyStatus(Integer id) {
        Policy policy = getPolicyById(id);
        policy.setIsActive(!policy.getIsActive());
        policyRepository.save(policy);
    }
}
