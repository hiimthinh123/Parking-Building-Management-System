package com.parking.management.service;

import com.parking.management.entity.PricePolicy;

import java.util.List;

public interface PricePolicyService {

    List<PricePolicy> getAllPricePolicies();
    boolean updatePricePolicy(PricePolicy policy);
    PricePolicy getPricePolicyByVehicleType(int vehicleTypeId);
    int cleanUpOldPolicies();
}