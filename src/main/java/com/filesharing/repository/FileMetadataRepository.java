package com.filesharing.repository;

import com.filesharing.model.FileMetadata;
import com.filesharing.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FileMetadataRepository extends JpaRepository<FileMetadata, UUID> {
    List<FileMetadata> findByOwner(User owner);
    
    @Query("SELECT f FROM FileMetadata f WHERE f.id = :fileId AND (f.accessLevel = 'PUBLIC' OR f.owner.id = :userId OR EXISTS (SELECT fa FROM FileAccess fa WHERE fa.file.id = f.id AND fa.user.id = :userId))")
    Optional<FileMetadata> findByIdWithAccess(UUID fileId, UUID userId);
    
    List<FileMetadata> findByAccessLevelAndOwnerNot(FileMetadata.AccessLevel accessLevel, User owner);
}
