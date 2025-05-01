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
public class FileAccessDto {
    private UUID id;
    private UUID fileId;
    private UUID userId;
    private String userEmail;
    private String userName;
    private boolean canView;
    private boolean canEdit;
    private boolean canUpload;
    private LocalDateTime createdAt;
}
