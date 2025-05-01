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
public class FileUploadResponseDto {
    private UUID id;
    private String fileName;
    private String contentType;
    private Long size;
    private String accessLevel;
    private LocalDateTime createdAt;
}
