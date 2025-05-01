package com.filesharing.service;

import com.filesharing.dto.FileAccessDto;
import com.filesharing.dto.FileDto;
import com.filesharing.dto.FileUploadResponseDto;
import com.filesharing.exception.AccessDeniedException;
import com.filesharing.exception.ResourceNotFoundException;
import com.filesharing.model.AccessLog;
import com.filesharing.model.FileAccess;
import com.filesharing.model.FileMetadata;
import com.filesharing.model.User;
import com.filesharing.repository.AccessLogRepository;
import com.filesharing.repository.FileAccessRepository;
import com.filesharing.repository.FileMetadataRepository;
import com.filesharing.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileService {

    private final FileMetadataRepository fileRepository;
    private final FileAccessRepository fileAccessRepository;
    private final AccessLogRepository accessLogRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;
    private final UserService userService;

    @Transactional
    public FileUploadResponseDto uploadFile(MultipartFile file, FileMetadata.AccessLevel accessLevel) throws IOException {
        User currentUser = userService.getCurrentUser();
        
        String objectKey = s3Service.uploadFile(file);
        
        FileMetadata fileMetadata = new FileMetadata();
        fileMetadata.setFileName(file.getOriginalFilename());
        fileMetadata.setContentType(file.getContentType());
        fileMetadata.setSize(file.getSize());
        fileMetadata.setS3ObjectKey(objectKey);
        fileMetadata.setS3BucketName(s3Service.getBucketName());
        fileMetadata.setAccessLevel(accessLevel);
        fileMetadata.setOwner(currentUser);
        
        fileMetadata = fileRepository.save(fileMetadata);
        
        // Log the upload
        AccessLog log = new AccessLog();
        log.setFile(fileMetadata);
        log.setUser(currentUser);
        log.setAction("UPLOAD");
        accessLogRepository.save(log);
        
        return FileUploadResponseDto.builder()
                .id(fileMetadata.getId())
                .fileName(fileMetadata.getFileName())
                .contentType(fileMetadata.getContentType())
                .size(fileMetadata.getSize())
                .accessLevel(fileMetadata.getAccessLevel().name())
                .createdAt(fileMetadata.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<FileDto> getUserFiles() {
        User currentUser = userService.getCurrentUser();
        return fileRepository.findByOwner(currentUser).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FileDto> getSharedWithMeFiles() {
        User currentUser = userService.getCurrentUser();
        return fileAccessRepository.findByUser(currentUser).stream()
                .map(FileAccess::getFile)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FileDto> getPublicFiles() {
        User currentUser = userService.getCurrentUser();
        return fileRepository.findByAccessLevelAndOwnerNot(FileMetadata.AccessLevel.PUBLIC, currentUser).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public String getFileDownloadUrl(UUID fileId, HttpServletRequest request) {
        User currentUser = userService.getCurrentUser();
        FileMetadata file = fileRepository.findByIdWithAccess(fileId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("File not found or access denied"));
        
        // Log the download
        AccessLog log = new AccessLog();
        log.setFile(file);
        log.setUser(currentUser);
        log.setAction("DOWNLOAD");
        log.setIpAddress(request.getRemoteAddr());
        log.setUserAgent(request.getHeader("User-Agent"));
        accessLogRepository.save(log);
        
        return s3Service.generatePresignedUrl(file.getS3ObjectKey(), Duration.ofMinutes(15));
    }

    @Transactional
    public void deleteFile(UUID fileId) {
        User currentUser = userService.getCurrentUser();
        FileMetadata file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));
        
        if (!file.getOwner().getId().equals(currentUser.getId()) && 
            !currentUser.getRole().equals(User.Role.ADMIN)) {
            throw new AccessDeniedException("You  && 
            !currentUser.getRole().equals(User.Role.ADMIN)) {
            throw new AccessDeniedException("You don't have permission to delete this file");
        }
        
        // Delete from S3
        s3Service.deleteFile(file.getS3ObjectKey());
        
        // Delete from database
        fileRepository.delete(file);
        
        // Log the deletion
        AccessLog log = new AccessLog();
        log.setFile(file);
        log.setUser(currentUser);
        log.setAction("DELETE");
        accessLogRepository.save(log);
    }

    @Transactional
    public void updateFileAccess(UUID fileId, FileMetadata.AccessLevel accessLevel) {
        User currentUser = userService.getCurrentUser();
        FileMetadata file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));
        
        if (!file.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You don't have permission to update this file");
        }
        
        file.setAccessLevel(accessLevel);
        fileRepository.save(file);
    }

    @Transactional
    public void shareFile(UUID fileId, UUID userId, boolean canView, boolean canEdit, boolean canUpload) {
        User currentUser = userService.getCurrentUser();
        FileMetadata file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));
        
        if (!file.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You don't have permission to share this file");
        }
        
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        FileAccess fileAccess = fileAccessRepository.findByFileAndUser(file, targetUser)
                .orElse(new FileAccess());
        
        fileAccess.setFile(file);
        fileAccess.setUser(targetUser);
        fileAccess.setCanView(canView);
        fileAccess.setCanEdit(canEdit);
        fileAccess.setCanUpload(canUpload);
        
        fileAccessRepository.save(fileAccess);
    }

    @Transactional
    public void removeFileAccess(UUID fileId, UUID userId) {
        User currentUser = userService.getCurrentUser();
        FileMetadata file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));
        
        if (!file.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You don't have permission to modify access for this file");
        }
        
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        FileAccess fileAccess = fileAccessRepository.findByFileAndUser(file, targetUser)
                .orElseThrow(() -> new ResourceNotFoundException("File access not found"));
        
        fileAccessRepository.delete(fileAccess);
    }

    @Transactional(readOnly = true)
    public List<FileAccessDto> getFileAccessList(UUID fileId) {
        User currentUser = userService.getCurrentUser();
        FileMetadata file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));
        
        if (!file.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You don't have permission to view access for this file");
        }
        
        return fileAccessRepository.findByFile(file).stream()
                .map(this::mapToAccessDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AccessLog> getFileAccessLogs(UUID fileId) {
        User currentUser = userService.getCurrentUser();
        FileMetadata file = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));
        
        if (!file.getOwner().getId().equals(currentUser.getId()) && 
            !currentUser.getRole().equals(User.Role.ADMIN)) {
            throw new AccessDeniedException("You don't have permission to view logs for this file");
        }
        
        return accessLogRepository.findByFile(file);
    }

    private FileDto mapToDto(FileMetadata file) {
        return FileDto.builder()
                .id(file.getId())
                .fileName(file.getFileName())
                .contentType(file.getContentType())
                .size(file.getSize())
                .accessLevel(file.getAccessLevel().name())
                .ownerName(file.getOwner().getFullName())
                .ownerId(file.getOwner().getId())
                .createdAt(file.getCreatedAt())
                .updatedAt(file.getUpdatedAt())
                .build();
    }

    private FileAccessDto mapToAccessDto(FileAccess fileAccess) {
        return FileAccessDto.builder()
                .id(fileAccess.getId())
                .fileId(fileAccess.getFile().getId())
                .userId(fileAccess.getUser().getId())
                .userEmail(fileAccess.getUser().getEmail())
                .userName(fileAccess.getUser().getFullName())
                .canView(fileAccess.isCanView())
                .canEdit(fileAccess.isCanEdit())
                .canUpload(fileAccess.isCanUpload())
                .createdAt(fileAccess.getCreatedAt())
                .build();
    }
}
