package com.hospital.grievance.repository;

import com.hospital.grievance.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByActiveTrueOrderByNameAsc();
    List<Location> findByHospitalIdAndActiveTrueOrderByNameAsc(Long hospitalId);
    boolean existsByNameIgnoreCase(String name);
}
