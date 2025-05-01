package com.filesharing.controller;

import com.filesharing.dto.UserDto;
import com.filesharing.model.AccessLog;
import com.filesharing.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser() {
        return ResponseEntity.ok(UserDto.builder()
                .id(userService.getCurrentUser().getId())
                .email(userService.getCurrentUser().getEmail())
                .fullName(userService.getCurrentUser().getFullName())
                .role(userService.getCurrentUser().getRole().name())
                .createdAt(userService.getCurrentUser().getCreatedAt())
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable UUID id, @RequestBody UserDto userDto) {
        return ResponseEntity.ok(userService.updateUser(id, userDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
