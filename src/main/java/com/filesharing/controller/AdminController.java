package com.filesharing.controller;

import com.filesharing.dto.UserDto;
import com.filesharing.model.AccessLog;
import com.filesharing.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{userId}/promote")
    public ResponseEntity<Void> promoteToAdmin(@PathVariable UUID userId) {
        adminService.promoteToAdmin(userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/{userId}/demote")
    public ResponseEntity<Void> demoteToUser(@PathVariable UUID userId) {
        adminService.demoteToUser(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/logs")
    public ResponseEntity<List<AccessLog>> getAllAccessLogs() {
        return ResponseEntity.ok(adminService.getAllAccessLogs());
    }

    @GetMapping("/logs/users/{userId}")
    public ResponseEntity<List<AccessLog>> getUserAccessLogs(@PathVariable UUID userId) {
        return ResponseEntity.ok(adminService.getUserAccessLogs(userId));
    }
}
