package com.filesharing.service;

import com.filesharing.dto.UserDto;
import com.filesharing.exception.ResourceNotFoundException;
import com.filesharing.model.AccessLog;
import com.filesharing.model.User;
import com.filesharing.repository.AccessLogRepository;
import com.filesharing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final AccessLogRepository accessLogRepository;

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void promoteToAdmin(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(User.Role.ADMIN);
        userRepository.save(user);
    }

    @Transactional
    public void demoteToUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(User.Role.USER);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public List<AccessLog> getAllAccessLogs() {
        return accessLogRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<AccessLog> getUserAccessLogs(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return accessLogRepository.findByUser(user);
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
