package com.hospital.grievance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class HospitalGrievanceApplication {

    public static void main(String[] args) {
        SpringApplication.run(HospitalGrievanceApplication.class, args);
    }
}
