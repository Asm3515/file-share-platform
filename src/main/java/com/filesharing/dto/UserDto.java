package com.filesharing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {
    private UUID id;
    private String email;
    private String fullName;
    private String role;
    private String password;
    private LocalDateTime createdAt;
}
