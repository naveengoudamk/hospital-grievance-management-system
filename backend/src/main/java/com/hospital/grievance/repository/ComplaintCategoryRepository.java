package com.hospital.grievance.repository;

import com.hospital.grievance.entity.ComplaintCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintCategoryRepository extends JpaRepository<ComplaintCategory, Long> {
    List<ComplaintCategory> findByActiveTrueOrderByNameAsc();
    boolean existsByNameIgnoreCase(String name);
}
